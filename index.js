  const moods = document.querySelectorAll(".mood");
    const chatbox = document.getElementById("chatbox");
    const chatlog = document.getElementById("chatlog");
    const userInput = document.getElementById("userInput");
    const sendBtn = document.getElementById("sendBtn");
    const controls = document.getElementById("controls");
    const journalSection = document.getElementById("journalSection");
    const saveJournal = document.getElementById("saveJournal");
    const journalEntry = document.getElementById("journalEntry");

    moods.forEach(btn => {
      btn.addEventListener("click", () => {
        chatbox.classList.remove("hidden");
        controls.classList.remove("hidden");
        journalSection.classList.remove("hidden");

        const mood = btn.dataset.mood;
        let moodMessage = "";

        switch (mood) {
          case "happy":
            moodMessage = "That's wonderful! 🌞 What made you smile today?";
            break;
          case "neutral":
            moodMessage = "Thanks for checking in. Want to chat about your day?";
            break;
          case "sad":
            moodMessage = "I’m sorry you’re feeling low 💙 I’m here for you.";
            break;
          case "angry":
            moodMessage = "Anger is okay to feel 😤 Want to talk or cool down?";
            break;
          case "tired":
            moodMessage = "Sounds like you’ve had a long day 😴 Want to rest or reflect?";
            break;
        }

        addMessage("bot", moodMessage);
      });
    });

    sendBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });

    function sendMessage() {
      const text = userInput.value.trim();
      if (!text) return;
      addMessage("user", text);
      userInput.value = "";

      setTimeout(() => {
        addMessage("bot", generateReply(text));
      }, 500);
    }

    function addMessage(sender, text) {
      const msg = document.createElement("div");
      msg.textContent = `${sender === "bot" ? "🤖" : "🧍"} ${text}`;
      chatlog.appendChild(msg);
      chatlog.scrollTop = chatlog.scrollHeight;
    }

    function generateReply(input) {
      const lower = input.toLowerCase();
      if (lower.includes("stress") || lower.includes("anxious"))
        return "Let’s pause and take a deep breath together 🧘";
      if (lower.includes("happy"))
        return "That’s great! Keep spreading those good vibes 🌻";
      if (lower.includes("sad"))
        return "I hear you. It’s okay to feel sad. Want to write something in your journal?";
      if (lower.includes("angry"))
        return "It’s okay to feel that way. Try counting to five and breathing out slowly.";
      if (lower.includes("tired"))
        return "Maybe some rest or light stretching could help. 🌙";
      return "I understand. Want to talk a bit more about that?";
    }

    saveJournal.addEventListener("click", () => {
      const entry = journalEntry.value.trim();
      if (entry) {
        const logs = JSON.parse(localStorage.getItem("gratitudeLogs") || "[]");
        logs.push({ entry, date: new Date().toLocaleString() });
        localStorage.setItem("gratitudeLogs", JSON.stringify(logs));
        addMessage("bot", "That’s beautiful 🌸 Gratitude helps heal the heart.");
        journalEntry.value = "";
      }
    });