"use client";
import axios from "axios";
import { useState } from "react";

export default function Home() {
  const userId = 'tony-stark-11'
  const [selectedTime, setSelectedTime] = useState("10:00");

  async function createEmailNotificationSchedule() {
    try {
      await axios.post(
        "/api/schedule-cron",
        {
          userId,
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

  async function cancelEmailNotificationSchedule() {
    try {
      await axios.post(
        "/api/cancel-schedule",
        {
          userId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      alert("Email notification schedule cancelled");
    } catch (e) {
      console.log("Client side error", e);
      alert("Error scheduling email notification");
    }
  }

  return (
    <main className="flex min-h-screen flex-col max-w-md justify-center p-24 mx-auto">
      <h1 className="text-xl font-bold text-neutral-600 mb-4">Email Notification for {userId}</h1>
      Send daily email summary at:
      <select
        onChange={(e) => setSelectedTime(e.target.value)}
        className="w-64 mt-4 h-12 text-white bg-neutral-800 p-2 rounded-lg border-2
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
        className="mt-4 rounded text-white bg-green-700 px-4 py-2"
        onClick={createEmailNotificationSchedule}
      >
        {" "}
        Schedule{" "}
      </button>
      <button
        className="mt-4 rounded text-white bg-red-500 px-4 py-2"
        onClick={cancelEmailNotificationSchedule}
      >
        {" "}
        Cancel Schedule{" "}
      </button>
    </main>
  );
}
