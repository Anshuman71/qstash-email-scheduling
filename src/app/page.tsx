"use client";
import axios from "axios";
import { useState } from "react";

export default function Home() {
  const [selectedTime, setSelectedTime] = useState("10:00");
  async function handleEmailNotificationSchedule() {
    try {
      await axios.post(
        "/api/schedule-cron",
        {
          userId: "tony11",
          selectedTime,
          utcOffset: new Date().getTimezoneOffset(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      alert("Email notification scheduled");
    } catch (e) {
      console.log("Client side error", e);
      alert("Error scheduling email notification");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      Send daily email summary at:
      <select
        onChange={(e) => setSelectedTime(e.target.value)}
        className="w-64 mt-4 h-12 bg-neutral-800 p-2 rounded-lg border-2
       border-neutral-600"
      >
        {new Array(24).fill(0).map((_, i) => {
          const time = i < 10 ? `0${i}:00` : `${i}:00`;
          return (
            <option key={i} value={time}>
              {time}
            </option>
          );
        })}
      </select>
      <button
        className="mt-4 rounded bg-neutral-700 px-4 py-2"
        onClick={handleEmailNotificationSchedule}
      >
        {" "}
        Schedule{" "}
      </button>
    </main>
  );
}
