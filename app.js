let currentQuestion = 0;
let correctAnswers = 0;
let timer;
let questions = [];
let timerInterval;
let difficulty = "high"; // Default difficulty
let passMark = 95;
let timePerQuestion = 5;

const SOUNDS = {
  tick: new Audio("./assets/sounds/clock-ticking.mp3"),
  success: new Audio("./assets/sounds/success.mp3"),
  failure: new Audio("./assets/sounds/failed.mp3"),
};

const MOTIVATIONAL_QUOTES = [
  "You're making progress! Keep going! 🌟",
  "Every mistake is a step toward success! 🚀",
  "You're braver than you believe! 💪",
  "The more you practice, the better you get! 📚",
  "Your effort today is your success tomorrow! ⭐",
];

// Preload sounds
Object.values(SOUNDS).forEach((sound) => {
  sound.load();
});

document.getElementById("answer").addEventListener("input", function () {
  document.getElementById("submitButton").disabled = this.value === "";
});

function updateInstructions() {
  const instructions = document.getElementById("instructions");

  // Set text based on current difficulty
  switch (difficulty) {
    case "low":
      instructions.innerHTML =
        "Get <strong>70%+</strong> marks from <strong>20 questions</strong>, <strong>15 seconds</strong> each.";
      break;
    case "medium":
      instructions.innerHTML =
        "Get <strong>80%+</strong> marks from <strong>20 questions</strong>, <strong>10 seconds</strong> each.";
      break;
    case "high":
      instructions.innerHTML =
        "Get <strong>95%+</strong> marks from <strong>20 questions</strong>, <strong>5 seconds</strong> each.";
      break;
  }
}

function setDifficulty(level) {
  difficulty = level;
  updateInstructions();
  switch (level) {
    case "low":
      passMark = 70;
      timePerQuestion = 15;
      break;
    case "medium":
      passMark = 80;
      timePerQuestion = 10;
      break;
    case "high":
      passMark = 95;
      timePerQuestion = 5;
      break;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("lowButton")
    .addEventListener("click", () => setDifficulty("low"));
  document
    .getElementById("mediumButton")
    .addEventListener("click", () => setDifficulty("medium"));
  document
    .getElementById("highButton")
    .addEventListener("click", () => setDifficulty("high"));

  // document.querySelector(".difficulty-buttons").classList.add("hidden");
  document.getElementById(
    "instructions"
  ).textContent = `Get ${passMark}%+ marks from 20 questions, ${timePerQuestion} seconds each`;
  document.querySelector(".input-group").classList.remove("hidden");

  setDifficulty("high"); // Initialize with high difficulty on page load

  const difficultyButtons = document.querySelectorAll(
    ".difficulty-buttons > button"
  );
  difficultyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setDifficulty(button.dataset.difficulty);
      difficultyButtons.forEach((btn) => btn.classList.remove("selected"));
      button.classList.add("selected");
    });
  });

  document.querySelectorAll('input[type="number"]').forEach((input) => {
    input.addEventListener("input", function () {
      if (this.value < 0) {
        this.value = 0;
      }
    });
  });

  document.getElementById("startButton").addEventListener("click", startQuiz);
  document.getElementById("resetButton").addEventListener("click", resetQuiz);
  document
    .getElementById("submitButton")
    .addEventListener("click", checkAnswer);

  document.addEventListener("keydown", function (event) {
    if (
      event.key === "Enter" &&
      document.getElementById("setup").style.display !== "none"
    ) {
      // Check if the focused element is within the setup form
      if (
        document.getElementById("setup").contains(event.target) &&
        (event.target.tagName === "INPUT" || event.target.tagName === "BUTTON")
      ) {
        event.preventDefault();
        startButton.click();
      }
    }
  });

  document.getElementById("answer").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      if (document.getElementById("submitButton").disabled) {
        e.preventDefault();
        return;
      }
      checkAnswer();
    }
  });
});

function createParticles() {
  const celebrationBg = document.querySelector(".celebration-bg");
  celebrationBg.innerHTML = "";
  const colors = ["#FFD700", "#FFA500", "#FF69B4", "#00FF00", "#40E0D0"];

  for (let i = 0; i < 50; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    particle.style.left = Math.random() * 100 + "vw";
    particle.style.animationDelay = Math.random() * 2 + "s";
    celebrationBg.appendChild(particle);
  }
}

function startQuiz() {
  const min = Math.max(
    1,
    parseInt(document.getElementById("minRange").value) || 1
  );
  const max = Math.max(
    1,
    parseInt(document.getElementById("maxRange").value) || 10
  );

  if (min >= max) {
    alert("Maximum number must be greater than minimum number");
    return;
  }

  questions = generateQuestions(min, max);
  document.getElementById("setup").classList.add("hidden");
  const quizElement = document.getElementById("quiz");
  quizElement.classList.remove("hidden");
  quizElement.classList.add("slide-enter");
  currentQuestion = 0;
  correctAnswers = 0;
  showQuestion();
}

function generateQuestions(min, max) {
  let questionList = [];
  for (let i = 0; i < 20; i++) {
    const num1 = Math.floor(Math.random() * (max - min + 1)) + min;
    const num2 = Math.floor(Math.random() * (max - min + 1)) + min;
    questionList.push({
      question: `${num1} × ${num2} = ?`,
      answer: num1 * num2,
    });
  }
  return questionList;
}

function showQuestion() {
  if (currentQuestion >= 20) {
    showResults();
    return;
  }

  const quizElement = document.getElementById("quiz");
  quizElement.classList.remove("slide-enter");
  void quizElement.offsetWidth; // Trigger reflow
  quizElement.classList.add("slide-enter");

  const questionEl = document.getElementById("question");
  const progressEl = document.getElementById("progress");
  const answerEl = document.getElementById("answer");

  questionEl.textContent = questions[currentQuestion].question;
  progressEl.innerHTML = `Question <span class="question-number">${currentQuestion + 1}</span>/20`;
  document.getElementById("submitButton").disabled = true; // Disable on new question
  answerEl.value = "";
  answerEl.focus();

  timer = timePerQuestion;
  updateTimer();

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer--;
    SOUNDS.tick.currentTime = 0;
    SOUNDS.tick.play();
    updateTimer();
    if (timer <= 0) {
      checkAnswer();
    }
  }, 1000);
}

function updateTimer() {
  document.getElementById("timer").textContent = timer;
}

function checkAnswer() {
  clearInterval(timerInterval);
  SOUNDS.tick.pause(); // Stop the tick sound
  SOUNDS.tick.currentTime = 0; // Reset tick sound
  const userAnswer = parseInt(document.getElementById("answer").value) || 0;
  if (userAnswer === questions[currentQuestion].answer) {
    correctAnswers++;
  }
  currentQuestion++;
  showQuestion();
}

function showResults() {
  document.getElementById("quiz").classList.add("hidden");
  const resultsElement = document.getElementById("results");
  resultsElement.classList.remove("hidden");
  resultsElement.classList.add("slide-enter");

  const percentage = (correctAnswers / 20) * 100;
  const scoreEl = document.getElementById("score");
  const feedbackEl = document.getElementById("feedback");
  const quoteEl = document.getElementById("motivationalQuote");

  scoreEl.textContent = `You got ${correctAnswers} out of 20 correct (${percentage}%)`;

  if (percentage >= passMark) {
    feedbackEl.textContent = "Congratulations! You're a multiplication master!";
    feedbackEl.style.fontSize = "22px";
    feedbackEl.style.fontWeight = "700";
    feedbackEl.style.color = "#2563EB"; // Blue color
    scoreEl.style.color = "#3CB371"; // MediumSeaGreen
    document.querySelector("#resetButton > span").textContent = "Replay";
    SOUNDS.success.play();
    createParticles();
    document.body.style.background =
      "linear-gradient(135deg, #6EE7B7, #3B82F6)";
  } else {
    feedbackEl.textContent = "Sorry! Keep practicing...";
    feedbackEl.style.fontSize = "22px";
    feedbackEl.style.fontWeight = "700";
    feedbackEl.style.color = "#DC143C"; // Crimson Red
    scoreEl.style.color = "#000000";
    document.querySelector("#resetButton > span").textContent = "Try Again";
    quoteEl.textContent =
      MOTIVATIONAL_QUOTES[
      Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
      ];
    SOUNDS.failure.play();
    document.querySelector(".gray-overlay").style.opacity = "1";
    document.body.style.background =
      "linear-gradient(135deg, #9CA3AF, #6B7280)";
  }
}

function resetQuiz() {
  document.getElementById("results").classList.add("hidden");
  document.getElementById("setup").classList.remove("hidden");
  document.querySelector(".gray-overlay").style.opacity = "0";
  document.body.style.background = "linear-gradient(135deg, #6EE7B7, #3B82F6)";
  const celebrationBg = document.querySelector(".celebration-bg");
  celebrationBg.innerHTML = "";
}

function createParticles() {
  // This function creates the celebratory particle effect
  const celebrationBg = document.querySelector(".celebration-bg");
  celebrationBg.innerHTML = ""; // Clear previous particles
  const colors = ["#FFD700", "#FFA500", "#FF69B4", "#00FF00", "#40E0D0"];

  for (let i = 0; i < 50; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)]; // Random color
    particle.style.left = Math.random() * 100 + "vw"; // Random horizontal position
    particle.style.animationDelay = Math.random() * 2 + "s"; // Random animation delay
    celebrationBg.appendChild(particle); // Add particle to the background
  }
}
