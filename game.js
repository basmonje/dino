"use strict";
var time = new Date();
var deltaTime = 0;

if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  setTimeout(Init, 1);
} else {
  document.addEventListener("DOMContentLoaded", Init);
}

function Init() {
  time = new Date();
  Start();
  Loop();
}

function Loop() {
  deltaTime = (new Date() - time) / 1000;
  time = new Date();
  Update();
  requestAnimationFrame(Loop);
}

var sueloY = 22;
var velY = 0;
var impulso = 900;
var gravedad = 2500;

var dinoPosX = 42;
var dinoPosY = sueloY;

var sueloX = 0;
var velEscenario = 1280 / 3;
var gameVel = 1;
var score = 0;

var parado = false;
var saltando = false;

var tiempoHastaObstaculo = 2;
var tiempoObstaculoMin = 0.7;
var tiempoObstaculoMax = 1.8;
var obstaculoPosY = 16;
var obstaculos = [];

var tiempoHastaNube = 0.5;
var tiempoNubeMin = 0.7;
var tiempoNubeMax = 2.7;
var maxNubeY = 270;
var minNubeY = 100;
var nubes = [];
var velNube = 0.5;

var contenedor;
var dino;
var textoScore;
var suelo;
var gameOver;

function Start() {
  gameOver = document.querySelector(".game-over");
  suelo = document.querySelector(".floor");
  contenedor = document.querySelector(".container");
  textoScore = document.querySelector(".score");
  dino = document.querySelector(".dino");
  document.addEventListener("keydown", HandleKeyDown);
}

function HandleKeyDown(e) {
  if (e.keyCode == 32) {
    Jump();
  }
}

function Jump() {
  if (dinoPosY === sueloY) {
    saltando = true;
    velY = impulso;
    dino.classList.remove("dino-run");
  }
}

function Update() {
  if (parado) return;

  MoverDino();
  MoverSuelo();
  DecidirCrearObstaculos();
  DecidirCrearNubes();
  MoverObstaculos();
  MoverNubes();
  DetectarColision();

  velY -= gravedad * deltaTime;
}

function MoverSuelo() {
  sueloX += CalcularDesplazamiento();
  suelo.style.left = -(sueloX % contenedor.clientWidth) + "px";
}

function CalcularDesplazamiento() {
  return velEscenario * deltaTime * gameVel;
}

function Estrellarse() {
  dino.classList.remove("dino-run");
  dino.classList.add("dino-estrellado");
  parado = true;
}

function MoverDino() {
  dinoPosY += velY * deltaTime;
  if (dinoPosY < sueloY) {
    tocarSuelo();
  }

  dino.style.bottom = dinoPosY + "px";
}

function tocarSuelo() {
  dinoPosY = sueloY;
  velY = 0;
  if (saltando) {
    dino.classList.add("dino-run");
  }
  saltando = false;
}

function DecidirCrearObstaculos() {
  tiempoHastaObstaculo -= deltaTime;
  if (tiempoHastaObstaculo <= 0) {
    crearObstaculo();
  }
}

function DecidirCrearNubes() {
  tiempoHastaNube -= deltaTime;
  if (tiempoHastaNube <= 0) {
    CrearNube();
  }
}

function crearObstaculo() {
  var obstaculo = document.createElement("div");
  contenedor.appendChild(obstaculo);
  obstaculo.classList.add("cactus");

  obstaculo.posX = contenedor.clientWidth;
  obstaculo.style.left = contenedor.clientWidth + "px";

  obstaculos.push(obstaculo);
  tiempoHastaObstaculo =
    tiempoObstaculoMin +
    (Math.random() * (tiempoObstaculoMax - tiempoObstaculoMin)) / gameVel;
}

function CrearNube() {
  var nube = document.createElement("div");

  contenedor.appendChild(nube);
  nube.classList.add("nube");
  nube.posX = contenedor.clientWidth;
  nube.style.left = contenedor.clientWidth + "px";
  nube.style.bottom =
    minNubeY + Math.random() * tiempoNubeMax - tiempoNubeMin + "px";

  nubes.push(nube);
  tiempoHastaNube =
    tiempoNubeMin + (Math.random() * (tiempoNubeMax - tiempoNubeMin)) / gameVel;
}

function MoverObstaculos() {
  for (var i = obstaculos.length - 1; i >= 0; i--) {
    if (obstaculos[i].posX < -obstaculos[i].clientWidth) {
      obstaculos[i].parentNode.removeChild(obstaculos[i]);
      obstaculos.splice(i, 1);
      ganarPuntos();
    } else {
      obstaculos[i].posX -= CalcularDesplazamiento();
      obstaculos[i].style.left = obstaculos[i].posX + "px";
    }
  }
}

function MoverNubes() {
  for (let i = nubes.length - 1; i >= 0; i--) {
    if (nubes[i].posX < -nubes[i].clientWidth) {
      nubes[i].parentNode.removeChild(nubes[i]);
      nubes.splice(i, 1);
    } else {
      nubes[i].posX -= CalcularDesplazamiento() * velNube;
      nubes[i].style.left = nubes[i].posX + "px";
    }
  }
}

function ganarPuntos() {
  score++;
  textoScore.innerText = score;

  if (score == 5) {
    gameVel = 1.5;
    contenedor.classList.add("mediodia");
  } else if (score == 10) {
    gameVel = 2;
    contenedor.classList.add("tarde");
  } else if (score == 20) {
    gameVel = 3;
    contenedor.classList.add("noche");
  }

  suelo.style.animationDuration = 3 / gameVel + "s";
}

function DetectarColision() {
  for (var i = 0; i < obstaculos.length; i++) {
    if (obstaculos[i].posX > dinoPosX + dino.clientWidth) {
      // Evade
      break;
    } else {
      if (isCollision(dino, obstaculos[i], 10, 30, 15, 20)) {
        GameOver();
      }
    }
  }
}

function isCollision(
  a,
  b,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft
) {
  var aRect = a.getBoundingClientRect();
  var bRect = b.getBoundingClientRect();

  return !(
    aRect.top + aRect.height - paddingBottom < bRect.top ||
    aRect.top + paddingTop > bRect.top + bRect.height ||
    aRect.left + aRect.width - paddingRight < bRect.left ||
    aRect.left + paddingLeft > bRect.left + bRect.width
  );
}

function GameOver() {
  Estrellarse();
  gameOver.style.display = "block";
}
