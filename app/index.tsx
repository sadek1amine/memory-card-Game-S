import React, { useEffect, useRef, useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";

const allEmojis = ["🍎", "🍌", "🍇", "🍓", "🍍", "🥝", "🍉", "🍒"];

function shuffleArray(array: string[]) {
  return [...array, ...array]
    .sort(() => Math.random() - 0.5)
    .map((emoji, index) => ({
      id: index,
      emoji,
      flipped: false,
      matched: false,
    }));
}

// ⏱ format time
function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${mins % 60}m ${secs}s`;
  }

  if (hours > 0) {
    return `${hours}h ${mins % 60}m ${secs}s`;
  }

  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }

  return `${secs}s`;
}

export default function Index() {
  const [level, setLevel] = useState(4);
  const [cards, setCards] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [time, setTime] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const timerRef = useRef<any>(null);

  // ⏱ TIMER (stop when win)
  useEffect(() => {
    if (gameWon) return; // 🚫 stop timer

    timerRef.current = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameWon]);

  // 🎮 init
  useEffect(() => {
    setCards(shuffleArray(allEmojis.slice(0, level)));
    setSelected([]);
    setGameWon(false);
    setTime(0);
  }, [level]);

  // 🎯 game logic
  useEffect(() => {
    if (selected.length !== 2) return;

    setDisabled(true);

    const [first, second] = selected;

    if (cards[first]?.emoji === cards[second]?.emoji) {
      const updated = cards.map((card, i) =>
        i === first || i === second
          ? { ...card, matched: true }
          : card
      );

      setCards(updated);
      setSelected([]);
      setDisabled(false);

      // 🏆 check win
      if (updated.every((c) => c.matched)) {
        setGameWon(true);
      }
    } else {
      setTimeout(() => {
        setCards((prev) =>
          prev.map((card, i) =>
            i === first || i === second
              ? { ...card, flipped: false }
              : card
          )
        );

        setSelected([]);
        setDisabled(false);
      }, 800);
    }
  }, [selected]);

  // 🎮 press
  const handlePress = (index: number) => {
    if (disabled || selected.length === 2) return;
    if (cards[index].flipped || cards[index].matched) return;

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);

    setSelected((prev) => [...prev, index]);
  };

  // 🔄 restart
  const restart = () => {
    setCards(shuffleArray(allEmojis.slice(0, level)));
    setSelected([]);
    setTime(0);
    setGameWon(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧠 Memory Game</Text>

      {/* ⏱ FORMATTED TIMER */}
      <Text style={styles.timer}>
        ⏱ {formatTime(time)}
      </Text>

      {/* Levels */}
      <View style={styles.levels}>
        {[4, 6, 8].map((lvl) => (
          <TouchableOpacity
            key={lvl}
            onPress={() => setLevel(lvl)}
            style={[
              styles.levelBtn,
              level === lvl && { backgroundColor: "#22c55e" },
            ]}
          >
            <Text style={styles.levelText}>{lvl}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Cards */}
      <View style={styles.grid}>
        {cards.map((card, index) => (
          <TouchableOpacity
            key={card.id}
            onPress={() => handlePress(index)}
          >
            <View style={styles.card}>
              <Text style={styles.cardText}>
                {card.flipped || card.matched ? card.emoji : "❓"}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Restart */}
      <TouchableOpacity style={styles.restart} onPress={restart}>
        <Text style={{ color: "#fff" }}>🔄 Restart</Text>
      </TouchableOpacity>

      {/* Win */}
      {gameWon && (
        <Text style={styles.win}>
          🎉 You Win!
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    color: "#fff",
    marginBottom: 10,
    fontWeight: "bold",
  },
  timer: {
    color: "#38bdf8",
    marginBottom: 10,
    fontSize: 18,
  },
  levels: {
    flexDirection: "row",
    marginBottom: 10,
  },
  levelBtn: {
    padding: 10,
    margin: 5,
    backgroundColor: "#1e293b",
    borderRadius: 8,
  },
  levelText: {
    color: "#fff",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 320,
    justifyContent: "center",
  },
  card: {
    width: 70,
    height: 70,
    margin: 5,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  cardText: {
    fontSize: 30,
  },
  restart: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#ef4444",
    borderRadius: 10,
  },
  win: {
    marginTop: 10,
    fontSize: 22,
    color: "#22c55e",
    fontWeight: "bold",
  },
});