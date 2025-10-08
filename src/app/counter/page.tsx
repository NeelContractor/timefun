"use client"
// THis is test message dashboard 
import React, { useState } from "react";
import { Search, MessageSquare, Phone, DollarSign } from "lucide-react";

export default function CreatorMessagesPage() {
  const [selected, setSelected] = useState(0);
  const [message, setMessage] = useState("");

  const creators = [
    {
      id: 0,
      name: "Ansem",
      handle: "@ansem",
      avatar: "https://i.pravatar.cc/80?img=12",
      price: 10.47,
      rating: 4.8,
      responseRate: "100%",
      lastMessage: "Hey — love your last post about latency. Quick question...",
    },
    {
      id: 1,
      name: "Kawz",
      handle: "@kawz",
      avatar: "https://i.pravatar.cc/80?img=45",
      price: 3.89,
      rating: 5,
      responseRate: "100%",
      lastMessage: "Can we hop on a quick call tomorrow?",
    },
    {
      id: 2,
      name: "Tim Welch",
      handle: "@timwelch",
      avatar: "https://i.pravatar.cc/80?img=33",
      price: 0.19,
      rating: 5,
      responseRate: "100%",
      lastMessage: "Thanks for the tip — saved my training session!",
    },
  ];

  const thread = [
    { from: "user", text: "Hey, I'd love 15 minutes to review my pitch deck." , time: "9:12 AM"},
    { from: "creator", text: "Sounds good — when are you available this week?", time: "9:14 AM"},
    { from: "user", text: "Tomorrow afternoon works for me.", time: "9:15 AM"},
  ];

  function sendMessage(e: any) {
    e.preventDefault();
    if (!message.trim()) return;
    // mock send — append to thread (in real app, push to API / websocket)
    thread.push({ from: "creator", text: message.trim(), time: "Now" });
    setMessage("");
    // optimistic UI: keep focus on selected thread
  }

  const selectedCreator = creators[selected];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <header className="border-b border-slate-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-extrabold tracking-tight">TIME.FUN</h1>
          <p className="text-sm text-slate-500">Message Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black border border-slate-100">
            <Search size={16} />
            <input className="bg-transparent outline-none text-sm" placeholder="Search messages or users" />
          </div>
          {/* <button className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold">Go Live</button> */}
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto grid grid-cols-12 gap-6 p-6">
        {/* Left: Creator list */}
        <aside className="col-span-4 border rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 flex items-center justify-between border-b">
            <div>
              <h2 className="text-lg font-semibold">Messages</h2>
              <p className="text-xs text-slate-500">Respond to fans & manage requests</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Available minutes</div>
              <div className="font-bold">1,420</div>
            </div>
          </div>

          <ul className="divide-y">
            {creators.map((c, i) => (
              <li
                key={c.id}
                onClick={() => setSelected(i)}
                className={`p-3 flex gap-3 items-center cursor-pointer hover:bg-slate-800 ${selected === i ? 'bg-slate-700' : ''}`}
              >
                <img src={c.avatar} alt="avatar" className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-xs text-slate-500">{c.handle}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">${c.price}/min</div>
                      <div className="text-xs text-slate-400">{c.rating} • {c.responseRate}</div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 mt-1 truncate">{c.lastMessage}</div>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Middle: Conversation */}
        <section className="col-span-8 border rounded-lg flex flex-col overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={selectedCreator.avatar} alt="avatar" className="w-12 h-12 rounded-full" />
              <div>
                <div className="font-semibold">{selectedCreator.name}</div>
                <div className="text-xs text-slate-500">{selectedCreator.handle} • ${selectedCreator.price}/min</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-slate-500"><MessageSquare size={16}/> DM</button>
              <button className="flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-slate-500"><Phone size={16}/> Call</button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-auto bg-black">
            <div className="space-y-3 max-h-[60vh]">
              {thread.map((m, idx) => (
                <div key={idx} className={`p-3 rounded-lg max-w-[80%] ${m.from === 'creator' ? 'bg-slate-800 self-start' : 'bg-emerald-800 self-end ml-auto'}`}>
                  <div className="text-sm">{m.text}</div>
                  <div className="text-xs text-slate-400 mt-1">{m.time}</div>
                </div>
              ))}

              {/* system notice */}
              {/* <div className="text-center text-xs text-slate-400 mt-4">You earned <span className="font-semibold">$12.34</span> from this conversation</div> */}
            </div>
          </div>

          <form onSubmit={sendMessage} className="p-4 border-t flex gap-3 items-center">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Reply as ${selectedCreator.name}...`}
              className="flex-1 px-3 py-2 rounded-lg border focus:outline-none"
            />
            <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold">Send</button>
          </form>
        </section>

        {/* Right: Creator stats / actions */}
        {/* <aside className="col-span-3 border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500">Your rate</div>
              <div className="text-xl font-bold">${selectedCreator.price}/min</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Response</div>
              <div className="font-semibold">{selectedCreator.responseRate}</div>
            </div>
          </div>

          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Quick actions</div>
                <div className="text-xs text-slate-500">Manage the way you sell time</div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2">
              <button className="w-full px-3 py-2 rounded-md border flex items-center justify-center gap-2"><DollarSign size={16}/> Adjust rate</button>
              <button className="w-full px-3 py-2 rounded-md border">Open calendar</button>
              <button className="w-full px-3 py-2 rounded-md border">Payout settings</button>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            <div className="font-semibold">Tips</div>
            <ul className="mt-2 list-disc pl-4 space-y-1">
              <li>Pin an intro message to speed replies</li>
              <li>Enable instant calls for higher conversion</li>
              <li>Keep your rate visible on profile</li>
            </ul>
          </div>
        </aside> */}
      </main>
    </div>
  );
}
