import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, set, update, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// * إعداد Firebase (استبدل القيم بمعلومات مشروعك) *
const firebaseConfig = {
    apiKey: "AIzaSyBOBwDQlQLWgIMH_6fWvOQ1xxCbzt4QWRU",
    authDomain: "vote-2c61f.firebaseapp.com",
    projectId: "vote-2c61f",
    storageBucket: "vote-2c61f.firebasestorage.app",
    messagingSenderId: "1025774404341",
    appId: "1:1025774404341:web:87209bcebfcda4a3ad3bbc"
  };

// * تهيئة Firebase *
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const buttons = document.querySelectorAll(".option-btn");
const submitBtn = document.getElementById("submit-btn");
const countdownText = document.getElementById("countdown");
const timerSpan = document.getElementById("timer");

let selectedOption = null;
let isVotingDisabled = false;
let voteChart;

// * تحديد الخيار عند الضغط على الزر *

buttons.forEach(button => {
    button.addEventListener("click", () => {
        if (isVotingDisabled) return;
        selectedOption = button.dataset.option;
        buttons.forEach(btn => btn.classList.remove("selected"));
        button.classList.add("selected");
        submitBtn.disabled = false;
//-
    });//+
});



// * إرسال التصويت مع عداد تنازلي *
submitBtn.addEventListener("click", async () => {
    if (!selectedOption || isVotingDisabled) return;

    const optionRef = ref(db, "votes/" + selectedOption);

    try {
        const snapshot = await get(optionRef);
        let currentVotes = snapshot.exists() ? snapshot.val() : 0;
        await set(optionRef, currentVotes + 1);

        submitBtn.disabled = true;
        isVotingDisabled = true;
        startCountdown();

        alert("تم التصويت بنجاح!");
    } catch (error) {
        console.error("حدث خطأ أثناء التصويت:", error);
    }
});

// * التحديث الفوري للأصوات وإنشاء الرسم البياني *
const updateChart = (data) => {
    if (!voteChart) {
        voteChart = new Chart(document.getElementById("voteChart"), {
            type: "bar",
            data: {
                labels: Object.keys(data),
                datasets: [{
                    label: "عدد الأصوات",
                    data: Object.values(data),
                    backgroundColor: ["#ff9999", "#99ccff", "#99ff99"]
                }]
            }
        });
    } else {
        voteChart.data.datasets[0].data = Object.values(data);
        voteChart.update();
    }
};

const voteData = {};
buttons.forEach(button => {
    const option = button.dataset.option;
    const optionRef = ref(db, "votes/" + option);

    onValue(optionRef, (snapshot) => {
        const count = snapshot.exists() ? snapshot.val() : 0;

      
        button.textContent = `${option} (${count} أصوات)`;//+

        voteData[option] = count;
        updateChart(voteData);
    });
});

// * عداد تنازلي لمنع التصويت المتكرر *
function startCountdown() {
    countdownText.classList.remove("hidden");
    let timeLeft = 10;
    timerSpan.textContent = timeLeft;

    const interval = setInterval(() => {
        timeLeft--;
        timerSpan.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(interval);
            isVotingDisabled = false;
            submitBtn.disabled = false;
            countdownText.classList.add("hidden");
        }
    }, 1000);
}