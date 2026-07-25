'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const pageStyles = `
  :root {
    --frost: #F6F8FC;
    --slate: #1C2B4A;
    --teal: #00C4B4;
    --white: #FFFFFF;
    --frost-blue: #C8D8EC;
    --muted-slate: #7A8BA8;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    font-family: 'Outfit', sans-serif;
    background: var(--frost);
    color: var(--slate);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  .hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 96px 24px 60px;
    overflow: hidden;
  }
  #stitchCanvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }
  .nav {
    position: fixed;
    top: 22px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    width: calc(100% - 48px);
    max-width: 1180px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 12px 14px 12px 26px;
    background: var(--white);
    border: 1px solid var(--frost-blue);
    border-radius: 999px;
    box-shadow: 0 4px 14px -10px rgba(28,43,74,0.08);
    opacity: 0;
  }
  .wordmark {
    font-weight: 700;
    font-size: 30px;
    letter-spacing: -0.025em;
    color: var(--slate);
    text-decoration: none;
    flex-shrink: 0;
    cursor: pointer;
    transition: transform 0.22s cubic-bezier(.15,.85,.25,1), filter 0.2s ease;
  }
  .wm-dot-com { color: var(--teal); }
  .wordmark:hover {
    transform: translateY(-2px) scale(1.05);
    filter: drop-shadow(0 4px 14px rgba(28,43,74,0.22));
  }
  .nav-links {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 30px;
  }
  .nav-links a {
    font-weight: 600;
    font-size: 15px;
    color: var(--muted-slate);
    text-decoration: none;
    transition: color 0.18s ease;
  }
  .nav-links a:hover { color: var(--slate); }
  .nav-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
  .nav-login {
    font-weight: 600;
    font-size: 15px;
    color: var(--slate);
    text-decoration: none;
    padding: 10px 16px;
    border-radius: 999px;
    transition: background 0.18s ease;
  }
  .nav-login:hover { background: rgba(28,43,74,0.06); }
  .nav-profile-wrap { position: relative; }
  .nav-profile-btn {
    width: 38px; height: 38px; border-radius: 50%;
    background: var(--teal); border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 15px;
    color: var(--white); flex-shrink: 0;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .nav-profile-btn:hover { transform: scale(1.07); box-shadow: 0 4px 14px -4px rgba(0,196,180,0.4); }
  .nav-profile-dropdown {
    position: absolute; top: calc(100% + 10px); right: 0;
    background: var(--white); border: 1px solid var(--frost-blue);
    border-radius: 16px; box-shadow: 0 16px 40px -12px rgba(28,43,74,0.18);
    padding: 8px; min-width: 200px; z-index: 200;
    display: none; flex-direction: column; gap: 2px;
  }
  .nav-profile-dropdown.open { display: flex; }
  .nav-profile-dropdown-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px;
    font-weight: 600; font-size: 14px; color: var(--slate);
    text-decoration: none; cursor: pointer; border: none; background: none;
    width: 100%; text-align: left;
    transition: background 0.15s ease, color 0.15s ease;
  }
  .nav-profile-dropdown-item:hover { background: var(--frost); }
  .nav-profile-dropdown-item svg { width: 16px; height: 16px; color: var(--muted-slate); flex-shrink: 0; }
  .nav-profile-dropdown-sep { height: 1px; background: var(--frost-blue); margin: 4px 0; }
  .nav-cta {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 15px;
    color: var(--white);
    background: var(--slate);
    border: none;
    border-radius: 999px;
    padding: 12px 22px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    transition: transform 0.15s ease, background 0.18s ease;
  }
  .nav-cta:hover { background: #16233d; transform: translateY(-1px); }
  .nav-cta .arrow { transition: transform 0.2s ease; }
  .nav-cta:hover .arrow { transform: translateX(3px); }
  .nav-plan-label {
    font-weight: 700; font-size: 13px; letter-spacing: 0.04em;
    padding: 8px 16px; border-radius: 999px;
    border: 1.5px solid var(--frost-blue);
    color: var(--muted-slate); background: var(--frost);
    cursor: default; white-space: nowrap;
  }
  .nav-plan-label.student { color: var(--muted-slate); }
  .nav-plan-label.founder { color: var(--slate); border-color: rgba(28,43,74,0.2); background: rgba(28,43,74,0.04); }
  .nav-plan-label.partner { color: var(--teal); border-color: rgba(0,196,180,0.3); background: rgba(0,196,180,0.06); }
  .nav-plan-label.label { color: #8B5CF6; border-color: rgba(139,92,246,0.3); background: rgba(139,92,246,0.06); }
  .stage {
    position: relative;
    z-index: 2;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 880px;
    margin: 0 auto;
    padding-top: 40px;
  }
  .eyebrow {
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--teal);
    margin-bottom: 22px;
    opacity: 0;
    cursor: default;
    transition: transform 0.2s cubic-bezier(.15,.85,.25,1), letter-spacing 0.25s ease, filter 0.2s ease;
  }
  .eyebrow:hover {
    transform: translateY(-2px) scale(1.04);
    letter-spacing: 0.26em;
    filter: drop-shadow(0 2px 8px rgba(0,196,180,0.35));
  }
  .hero-headline {
    font-weight: 800;
    font-size: clamp(34px, 4.6vw, 56px);
    line-height: 1.06;
    letter-spacing: -0.025em;
    text-align: center;
    max-width: 22ch;
    color: var(--slate);
    opacity: 0;
  }
  .subhead {
    font-weight: 400;
    font-size: clamp(15px, 1.6vw, 18px);
    line-height: 1.55;
    color: var(--muted-slate);
    text-align: center;
    max-width: 46ch;
    margin-top: 22px;
    opacity: 0;
  }
  .chat {
    width: 100%;
    max-width: 720px;
    margin-top: 28px;
    height: 440px;
    background: var(--white);
    border: 1px solid var(--frost-blue);
    border-radius: 28px;
    padding: 24px 24px 22px;
    box-shadow: 0 24px 60px -30px rgba(28,43,74,0.14);
    display: flex;
    flex-direction: column;
    opacity: 0;
  }
  .chat-head {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 11px;
    padding-bottom: 16px;
    margin-bottom: 8px;
    border-bottom: 1px solid var(--frost-blue);
  }
  .chat-head .dot-live {
    width: 9px; height: 9px; border-radius: 50%;
    background: var(--teal);
    box-shadow: 0 0 0 4px rgba(0,196,180,0.18);
  }
  .chat-head .label {
    font-weight: 600; font-size: 14px; color: var(--muted-slate);
  }
  .thread {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding-right: 8px;
    padding-top: 4px;
    scroll-behavior: smooth;
  }
  .thread::-webkit-scrollbar { width: 6px; }
  .thread::-webkit-scrollbar-track { background: transparent; }
  .thread::-webkit-scrollbar-thumb { background: var(--frost-blue); border-radius: 3px; }
  .msg-row {
    display: flex;
    align-items: flex-end;
    gap: 13px;
    opacity: 0;
    transform: translateY(10px);
    animation: bubbleIn 0.45s cubic-bezier(.2,.7,.3,1) forwards;
  }
  .msg-row.user { justify-content: flex-end; }
  .avatar {
    flex-shrink: 0;
    width: 42px; height: 42px;
    display: flex; align-items: center; justify-content: center;
  }
  .avatar svg { width: 100%; height: 100%; display: block; }
  .bubble {
    background:
      linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 50%),
      linear-gradient(145deg, #00BFB4 0%, #009E92 100%);
    box-shadow:
      0 3px 8px -4px rgba(0,140,128,0.20),
      inset 0 1px 0 rgba(255,255,255,0.18);
    border: 1px solid rgba(255,255,255,0.08);
    color: var(--white);
    font-weight: 400;
    font-size: 18px;
    line-height: 1.5;
    padding: 15px 20px;
    border-radius: 20px 20px 20px 7px;
    max-width: 88%;
  }
  .bubble strong { font-weight: 700; }
  .bubble.user {
    background: var(--frost);
    color: var(--slate);
    border: 1px solid var(--frost-blue);
    border-radius: 20px 20px 7px 20px;
  }
  .typing { display: flex; align-items: center; gap: 13px; }
  .typing-bubble {
    background: var(--frost);
    border: 1px solid var(--frost-blue);
    border-radius: 20px 20px 20px 7px;
    padding: 17px 20px;
    display: flex; gap: 6px;
  }
  .dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--muted-slate);
    animation: blink 1.3s infinite ease-in-out both;
  }
  .dot:nth-child(2) { animation-delay: 0.2s; }
  .dot:nth-child(3) { animation-delay: 0.4s; }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 2px;
    padding-left: 55px;
    opacity: 0;
    animation: fadeUp 0.5s ease forwards;
  }
  .chip {
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: 14.5px;
    color: var(--teal);
    background: rgba(0,196,180,0.08);
    border: 1px solid rgba(0,196,180,0.38);
    border-radius: 999px;
    padding: 10px 17px;
    cursor: pointer;
    transition: background 0.18s ease, transform 0.15s ease;
  }
  .chip:hover { background: rgba(0,196,180,0.16); transform: translateY(-1px); }
  .chat-cta {
    align-self: flex-start;
    margin-left: 55px;
    margin-top: 2px;
    display: inline-flex; align-items: center; gap: 8px;
    font-family: 'Outfit', sans-serif;
    font-weight: 700; font-size: 16px;
    color: var(--white);
    background: var(--slate);
    border: none; border-radius: 14px;
    padding: 14px 26px;
    cursor: pointer;
    opacity: 0; animation: fadeUp 0.5s ease forwards;
    transition: transform 0.15s ease, background 0.18s ease;
    box-shadow: 0 8px 20px -10px rgba(28,43,74,0.22);
  }
  .chat-cta:hover { background: #16233d; transform: translateY(-2px); }
  .chat-cta .arrow { transition: transform 0.2s ease; }
  .chat-cta:hover .arrow { transform: translateX(3px); }
  .chat-input {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 6px;
    padding: 14px 18px;
    background: var(--frost);
    border: 1px solid var(--frost-blue);
    border-radius: 16px;
    flex-shrink: 0;
  }
  .chat-input span { font-weight: 400; font-size: 16px; color: var(--muted-slate); flex: 1; }
  .chat-input .send {
    width: 34px; height: 34px; border-radius: 10px;
    background: var(--slate); color: var(--white);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateX(-50%) translateY(-16px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  @keyframes headlineIn {
    from { opacity: 0; transform: translateY(18px); filter: blur(6px); }
    to   { opacity: 1; transform: translateY(0); filter: blur(0); }
  }
  @keyframes chatIn {
    0%   { opacity: 0; transform: translateY(70px) scale(0.86); }
    55%  { opacity: 1; transform: translateY(-10px) scale(1.03); }
    75%  { transform: translateY(4px) scale(0.99); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes bubbleIn { to { opacity: 1; transform: translateY(0); } }
  @keyframes blink {
    0%, 80%, 100% { opacity: 0.25; transform: scale(0.85); }
    40% { opacity: 1; transform: scale(1); }
  }
  .hiw-section {
    background: var(--frost);
    padding: 100px 24px 110px;
  }
  .hiw-container { max-width: 1080px; margin: 0 auto; }
  .hiw-eyebrow {
    font-weight: 600; font-size: 12px; letter-spacing: 0.18em;
    text-transform: uppercase; color: var(--teal); margin-bottom: 18px; opacity: 0;
  }
  .hiw-heading {
    font-weight: 800; font-size: clamp(30px, 4vw, 48px); line-height: 1.08;
    letter-spacing: -0.025em; color: var(--slate); margin-bottom: 16px; opacity: 0;
  }
  .hiw-sub {
    font-weight: 400; font-size: 17px; line-height: 1.6; color: var(--muted-slate);
    max-width: 44ch; margin-bottom: 72px; opacity: 0;
  }
  .hiw-steps { display: flex; align-items: flex-start; gap: 0; }
  .hiw-step { flex: 1; display: flex; flex-direction: column; gap: 16px; opacity: 0; }
  .hiw-divider {
    width: 1px; align-self: stretch; background: var(--frost-blue);
    margin: 0 48px; flex-shrink: 0; opacity: 0;
  }
  .hiw-num { font-weight: 700; font-size: 13px; letter-spacing: 0.1em; color: var(--teal); }
  .hiw-title { font-weight: 700; font-size: 22px; letter-spacing: -0.02em; color: var(--slate); }
  .hiw-desc { font-weight: 400; font-size: 15.5px; line-height: 1.7; color: var(--muted-slate); }
  @media (max-width: 720px) {
    .hiw-steps { flex-direction: column; gap: 40px; }
    .hiw-divider { width: 100%; height: 1px; align-self: auto; margin: 0; }
    .hiw-section { padding: 80px 20px 88px; }
  }
  .entry-section {
    background: var(--frost);
    padding: 100px 24px 110px;
    position: relative;
    overflow: hidden;
  }
  .entry-container { max-width: 1080px; margin: 0 auto; position: relative; z-index: 1; }
  .entry-icon-wrap {
    width: 46px; height: 46px; background: rgba(0,196,180,0.1);
    border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px;
  }
  .entry-icon { width: 22px; height: 22px; color: var(--teal); }
  .entry-eyebrow {
    font-weight: 600; font-size: 12px; letter-spacing: 0.18em;
    text-transform: uppercase; color: var(--teal); margin-bottom: 18px; opacity: 0;
  }
  .entry-heading {
    font-weight: 800; font-size: clamp(30px, 4vw, 48px); line-height: 1.08;
    letter-spacing: -0.025em; color: var(--slate); max-width: 16ch; margin-bottom: 18px; opacity: 0;
  }
  .entry-sub {
    font-weight: 400; font-size: 17px; line-height: 1.6; color: var(--muted-slate);
    max-width: 48ch; margin-bottom: 56px; opacity: 0;
  }
  .entry-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
  .entry-card-wide { grid-column: 1 / -1; }
  .entry-card {
    background: var(--frost);
    border: 1px solid var(--frost-blue);
    border-radius: 22px;
    padding: 36px 36px 32px;
    display: flex; flex-direction: column; gap: 14px;
    cursor: pointer; opacity: 0;
    transition: transform 0.22s cubic-bezier(.15,.85,.25,1), box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
  }
  .entry-card:hover {
    transform: translateY(-4px);
    background: var(--white);
    border-color: rgba(0,196,180,0.4);
    box-shadow: 0 16px 40px -16px rgba(28,43,74,0.14);
  }
  .entry-num { font-weight: 700; font-size: 13px; letter-spacing: 0.08em; color: var(--teal); }
  .entry-title { font-weight: 700; font-size: 22px; letter-spacing: -0.02em; color: var(--slate); }
  .entry-desc { font-weight: 400; font-size: 15.5px; line-height: 1.65; color: var(--muted-slate); flex: 1; }
  .entry-btn {
    font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 14.5px;
    color: var(--teal); background: none; border: none; padding: 0; cursor: pointer;
    display: inline-flex; align-items: center; gap: 6px; margin-top: 6px;
    text-decoration: none; transition: gap 0.18s ease;
  }
  .entry-btn:hover { gap: 10px; }
  @media (max-width: 720px) {
    .entry-grid { grid-template-columns: 1fr; }
    .entry-section { padding: 80px 20px 88px; }
    .entry-card { padding: 28px 26px 24px; }
  }
  .pricing-section { background: var(--frost); padding: 100px 24px 120px; }
  .pricing-container { max-width: 1320px; margin: 0 auto; }
  .pricing-eyebrow {
    font-weight: 600; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--teal); margin-bottom: 18px; opacity: 0; text-align: center;
  }
  .pricing-heading {
    font-weight: 800; font-size: clamp(30px, 4vw, 48px); line-height: 1.08;
    letter-spacing: -0.025em; color: var(--slate); margin-bottom: 16px; opacity: 0; text-align: center;
  }
  .pricing-sub {
    font-weight: 400; font-size: 17px; line-height: 1.6; color: var(--muted-slate);
    max-width: 48ch; margin-bottom: 40px; opacity: 0; text-align: center;
    margin-left: auto; margin-right: auto;
  }
  .pricing-toggle-wrap {
    display: flex; align-items: center; gap: 0;
    background: rgba(28,43,74,0.07); border-radius: 999px; padding: 4px;
    width: fit-content; margin: 0 auto 52px;
  }
  .toggle-btn {
    font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 14px;
    color: var(--muted-slate); background: none; border: none; padding: 9px 22px;
    border-radius: 999px; cursor: pointer; transition: background 0.18s ease, color 0.18s ease;
  }
  .toggle-btn.active { background: var(--white); color: var(--slate); box-shadow: 0 2px 8px -4px rgba(28,43,74,0.15); }
  .save-badge { font-size: 11px; font-weight: 700; color: var(--teal); background: rgba(0,196,180,0.12); border-radius: 999px; padding: 3px 8px; margin-left: 6px; }
  .pricing-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; align-items: stretch; }
  .pricing-card {
    background: var(--slate); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px; padding: 36px 32px 32px;
    display: flex; flex-direction: column; gap: 28px;
    opacity: 0; position: relative;
    transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .pricing-card:hover { transform: translateY(-10px); }
  .pricing-card-partner {
    border-color: rgba(0,196,180,0.3);
    box-shadow: 0 0 0 1px rgba(0,196,180,0.2), 0 20px 50px -20px rgba(28,43,74,0.4);
  }
  .pricing-card-label {
    border-color: rgba(139,92,246,0.4);
    box-shadow: 0 0 0 1px rgba(139,92,246,0.2), 0 20px 50px -20px rgba(139,92,246,0.3);
  }
  .pricing-card-label .plan-badge { background: #8B5CF6; }
  .plan-badge {
    background: var(--teal); color: var(--white); font-weight: 700; font-size: 11px;
    letter-spacing: 0.04em; padding: 4px 12px; border-radius: 999px; white-space: nowrap;
    display: inline-flex; align-items: center; flex-shrink: 0;
  }
  .plan-header { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .pricing-card-top { display: flex; flex-direction: column; gap: 10px; }
  .plan-name { font-weight: 700; font-size: 18px; color: var(--white); }
  .plan-desc { font-weight: 400; font-size: 14px; line-height: 1.5; color: rgba(255,255,255,0.55); }
  .plan-price { display: flex; align-items: baseline; gap: 4px; margin-top: 6px; }
  .plan-amount { font-weight: 800; font-size: 42px; letter-spacing: -0.03em; color: var(--white); }
  .plan-period { font-weight: 400; font-size: 15px; color: rgba(255,255,255,0.45); }
  .plan-features { list-style: none; display: flex; flex-direction: column; gap: 12px; flex: 1; }
  .plan-features li {
    display: flex; align-items: flex-start; gap: 10px;
    font-weight: 400; font-size: 14.5px; line-height: 1.5; color: rgba(255,255,255,0.8);
  }
  .check { color: var(--teal); font-weight: 700; font-size: 14px; flex-shrink: 0; margin-top: 1px; }
  .plan-btn {
    display: block; text-align: center; font-family: 'Outfit', sans-serif;
    font-weight: 700; font-size: 15px; padding: 14px 24px; border-radius: 14px;
    text-decoration: none; color: rgba(255,255,255,0.8);
    background: transparent; border: 1.5px solid rgba(255,255,255,0.22);
    transition: background 0.22s ease, color 0.22s ease, border-color 0.22s ease;
  }
  .pricing-card:hover .plan-btn { background: var(--white); color: var(--slate); border-color: var(--white); }
  .pricing-card-partner:hover .plan-btn { background: var(--teal); color: var(--white); border-color: var(--teal); }
  .pricing-card-label:hover .plan-btn { background: #8B5CF6; color: var(--white); border-color: #8B5CF6; }
  .sidebar-panel {
    position: fixed; left: 24px; top: 50%;
    transform: translateY(-50%) translateX(-18px);
    z-index: 200; display: flex; flex-direction: column;
    align-items: center; gap: 10px; opacity: 0; pointer-events: none;
    transition: opacity 0.5s cubic-bezier(.2,.8,.3,1), transform 0.5s cubic-bezier(.2,.8,.3,1);
  }
  .sidebar-panel.visible { opacity: 1; transform: translateY(-50%) translateX(0); pointer-events: all; }
  .sidebar-logo {
    width: 48px; height: 48px; border-radius: 50%; background: var(--white);
    border: 1px solid var(--frost-blue); display: flex; align-items: center; justify-content: center;
    cursor: pointer; text-decoration: none; position: relative;
    box-shadow: 0 2px 8px -4px rgba(28,43,74,0.10);
    transition: background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
  }
  .sidebar-logo:hover { background: var(--frost); color: var(--slate); transform: scale(1.1); box-shadow: 0 4px 16px -6px rgba(28,43,74,0.16); }
  .sidebar-logo svg { width: 18px; height: 18px; color: var(--muted-slate); }
  .sidebar-logo::before {
    content: 'Back to top'; position: absolute; left: calc(100% + 12px); top: 50%;
    transform: translateY(-50%); background: var(--slate); color: var(--white);
    font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 12px;
    padding: 6px 12px; border-radius: 8px; white-space: nowrap;
    opacity: 0; pointer-events: none; transition: opacity 0.15s ease;
  }
  .sidebar-logo:hover::before { opacity: 1; }
  .sidebar-sep { width: 1px; height: 16px; background: var(--frost-blue); flex-shrink: 0; }
  .sidebar-item {
    width: 48px; height: 48px; border-radius: 50%; background: var(--white);
    border: 1px solid var(--frost-blue); display: flex; align-items: center; justify-content: center;
    cursor: pointer; text-decoration: none; color: var(--muted-slate); position: relative;
    transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
    box-shadow: 0 2px 8px -4px rgba(28,43,74,0.10);
  }
  .sidebar-item:hover { background: var(--frost); color: var(--slate); transform: scale(1.1); box-shadow: 0 4px 16px -6px rgba(28,43,74,0.16); }
  .sidebar-item svg { width: 18px; height: 18px; }
  .sidebar-item::before {
    content: attr(data-tip); position: absolute; left: calc(100% + 12px); top: 50%;
    transform: translateY(-50%); background: var(--slate); color: var(--white);
    font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 12px;
    padding: 6px 12px; border-radius: 8px; white-space: nowrap;
    opacity: 0; pointer-events: none; transition: opacity 0.15s ease;
  }
  .sidebar-item:hover::before { opacity: 1; }
  .footer { background: var(--frost); padding: 72px 24px 0; }
  .footer-container { max-width: 1080px; margin: 0 auto; }
  .footer-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 48px; padding-bottom: 56px; }
  .footer-wordmark { font-weight: 700; font-size: 22px; letter-spacing: -0.025em; color: var(--slate); }
  .footer-wordmark .wm-dot-com { color: var(--teal); }
  .footer-tagline { font-weight: 400; font-size: 14px; color: var(--muted-slate); margin-top: 8px; }
  .footer-cols { display: flex; gap: 64px; flex-shrink: 0; }
  .footer-col h4 { font-weight: 700; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--slate); margin-bottom: 16px; }
  .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 12px; }
  .footer-col a { font-weight: 400; font-size: 14.5px; color: var(--muted-slate); text-decoration: none; transition: color 0.18s ease; }
  .footer-col a:hover { color: var(--slate); }
  .footer-sep { height: 1px; background: var(--frost-blue); }
  .footer-bottom { display: flex; align-items: center; justify-content: space-between; padding: 24px 0 48px; gap: 24px; }
  .footer-copy { font-weight: 400; font-size: 13px; color: var(--muted-slate); }
  .footer-socials { display: flex; align-items: center; gap: 16px; }
  .footer-social {
    width: 36px; height: 36px; border-radius: 50%; background: var(--white);
    border: 1px solid var(--frost-blue); display: flex; align-items: center; justify-content: center;
    color: var(--muted-slate); text-decoration: none;
    transition: color 0.18s ease, border-color 0.18s ease, background 0.18s ease;
  }
  .footer-social:hover { color: var(--slate); border-color: var(--slate); background: var(--frost); }
  .footer-social svg { width: 16px; height: 16px; }
  @media (max-width: 720px) {
    .footer-top { flex-direction: column; gap: 40px; }
    .footer-cols { gap: 40px; flex-wrap: wrap; }
  }
  .stitch-footer { position: relative; height: 110px; background: var(--frost); overflow: hidden; }
  #stitchFooterCanvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  .stitch-divider { display: block; position: relative; height: 110px; background: var(--frost); overflow: hidden; }
  .stitch-divider canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  @media (max-width: 820px) { .nav-links { display: none; } }
  @media (max-width: 640px) {
    .nav { padding: 9px 9px 9px 18px; width: calc(100% - 32px); }
    .nav-links { display: none; }
    .nav-login { display: inline-flex; font-size: 13px; padding: 8px 12px; color: var(--muted-slate); }
    .nav-login:hover { background: none; }
    .wordmark { font-size: 20px; }
    .nav-cta { font-size: 13px; padding: 9px 16px; }
    #stitchCanvas { display: none; }
    .hero { padding: 90px 20px 20px; min-height: unset; }
    .stage { padding-top: 12px; }
    .hero-headline { font-size: 30px; max-width: 100%; }
    .subhead { font-size: 15px; margin-top: 16px; max-width: 100%; }
    .eyebrow { font-size: 11px; margin-bottom: 16px; }
    .chat { height: 400px; margin-top: 28px; padding: 16px 14px 12px; border-radius: 20px; }
    .chat-head { padding-bottom: 12px; margin-bottom: 4px; }
    .avatar { width: 34px; height: 34px; }
    .bubble { font-size: 14px; padding: 11px 14px; }
    .typing-bubble { padding: 13px 14px; }
    .chips { padding-left: 46px; gap: 8px; }
    .chip { font-size: 13px; padding: 8px 14px; }
    .chat-cta { font-size: 14px; padding: 11px 20px; margin-left: 46px; }
    .chat-input { padding: 11px 14px; }
    .chat-input span { font-size: 14px; }
    .thread { gap: 14px; }
    .stitch-divider:first-of-type { margin-top: 20px; }
    .hiw-section { padding: 52px 20px 64px; }
    .hiw-heading { font-size: 26px; margin-bottom: 12px; }
    .hiw-sub { font-size: 15px; margin-bottom: 40px; }
    .hiw-steps { gap: 28px; }
    .hiw-title { font-size: 19px; }
    .hiw-desc { font-size: 14.5px; }
    .entry-section { padding: 52px 20px 64px; }
    .entry-heading { font-size: 26px; }
    .entry-sub { font-size: 15px; margin-bottom: 36px; max-width: 100%; }
    .entry-grid { grid-template-columns: 1fr; gap: 12px; }
    .entry-card-wide { grid-column: 1; }
    .entry-card { padding: 22px 20px 18px; gap: 10px; }
    .entry-title { font-size: 18px; }
    .entry-desc { font-size: 14px; }
    .pricing-section { padding: 52px 20px 72px; }
    .pricing-heading { font-size: 26px; }
    .pricing-sub { font-size: 15px; max-width: 100%; }
    .pricing-grid { grid-template-columns: 1fr; gap: 14px; }
    .pricing-card { padding: 28px 24px 24px; gap: 22px; }
    .plan-amount { font-size: 38px; }
    .plan-features li { font-size: 14px; }
    .pricing-card .plan-btn { background: var(--white); color: var(--slate); border-color: var(--white); }
    .sidebar-panel { display: none; }
    .footer { padding: 48px 20px 0; }
    .footer-top { gap: 28px; padding-bottom: 36px; }
    .footer-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 28px 20px; width: 100%; }
    .footer-bottom { flex-direction: column; align-items: flex-start; gap: 14px; padding-bottom: 36px; }
  }
`

export default function LandingPage() {
  const [authedUser, setAuthedUser] = useState<{ email: string; name: string } | null>(null)
  const [userPlan, setUserPlan] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setAuthedUser({
          email: user.email ?? '',
          name: user.user_metadata?.full_name ?? user.email ?? '',
        })
        const { data: brands } = await supabase
          .from('brands')
          .select('plan')
          .eq('user_id', user.id)
          .limit(1)
        setUserPlan(brands?.[0]?.plan ?? 'student')
      }
    })
  }, [])

  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen])

  useEffect(() => {
    const thread      = document.getElementById('thread') as HTMLElement
    const chatEl      = document.getElementById('chat') as HTMLElement
    const navEl       = document.querySelector('.nav') as HTMLElement
    const eyebrowEl   = document.querySelector('.eyebrow') as HTMLElement
    const hl          = document.querySelector('.hero-headline') as HTMLElement
    const subhead     = document.querySelector('.subhead') as HTMLElement
    const sidebarPanel = document.getElementById('sidebarPanel') as HTMLElement

    const scrollDown = () => thread.scrollTo({ top: thread.scrollHeight, behavior: 'smooth' })

    const AVATAR = `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="sarti">
        <rect x="3"  y="36" width="15" height="30" rx="7.5" fill="#1C2B4A"/>
        <rect x="82" y="36" width="15" height="30" rx="7.5" fill="#1C2B4A"/>
        <circle cx="50" cy="51" r="39" fill="#00C4B4"/>
        <rect x="20" y="27" width="60" height="47" rx="22" fill="#11A496"/>
        <path d="M29 54 L37.5 45 L46 54" fill="none" stroke="#1C2B4A" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M54 54 L62.5 45 L71 54" fill="none" stroke="#1C2B4A" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`

    const messages = [
      "Hey, I'm <strong>sarti</strong>. Your co-partner for building and growing your clothing brand.",
      "Starting fresh or already have something going. I'll meet you where you are and help you get where you want to be.",
    ]

    function showTyping() {
      const row = document.createElement('div')
      row.className = 'msg-row typing'
      row.innerHTML = `<div class="avatar">${AVATAR}</div><div class="typing-bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`
      thread.appendChild(row)
      scrollDown()
      return row
    }

    function showMessage(html: string) {
      const row = document.createElement('div')
      row.className = 'msg-row'
      row.innerHTML = `<div class="avatar">${AVATAR}</div><div class="bubble">${html}</div>`
      thread.appendChild(row)
      scrollDown()
    }

    function showCtaButton() {
      const btn = document.createElement('button')
      btn.className = 'chat-cta'
      btn.innerHTML = `Get started <span class="arrow">→</span>`
      thread.appendChild(btn)
      scrollDown()
    }

    function showInput() {
      const el = document.createElement('div')
      el.className = 'chat-input'
      el.style.opacity = '0'
      el.style.animation = 'fadeUp 0.5s ease forwards'
      el.innerHTML = `<span></span><div class="send">↑</div>`
      chatEl.appendChild(el)
    }

    function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

    function trigger(el: HTMLElement, anim: string, delay: number) {
      setTimeout(() => {
        el.style.animation = 'none'
        el.offsetHeight
        el.style.animation = anim
      }, delay)
    }

    let playing = false

    async function playIntro() {
      if (playing) return
      playing = true

      thread.innerHTML = ''
      const oldInput = chatEl.querySelector('.chat-input')
      if (oldInput) oldInput.remove()

      const atTop = window.scrollY <= 100

      ;[eyebrowEl, hl, subhead, chatEl].forEach(el => {
        el.style.animation = 'none'
        el.offsetHeight
      })
      if (atTop) {
        navEl.style.animation = 'none'
        navEl.offsetHeight
      }

      if (atTop) trigger(navEl, 'slideDown 0.55s cubic-bezier(.2,.7,.3,1) forwards', 0)
      trigger(eyebrowEl, 'fadeUp 0.6s ease forwards', 230)
      trigger(hl,        'headlineIn 0.75s cubic-bezier(.2,.7,.3,1) forwards', 400)
      trigger(subhead,   'fadeUp 0.6s ease forwards', 530)
      trigger(chatEl,    'chatIn 0.85s cubic-bezier(.2,.8,.3,1) forwards', 680)

      await sleep(1150)
      hl.style.animation = ''
      hl.style.opacity = '1'
      for (let i = 0; i < messages.length; i++) {
        const typing = showTyping()
        await sleep(i === 0 ? 350 + messages[i].length * 5 : 380)
        typing.remove()
        showMessage(messages[i])
        await sleep(i === 0 ? 1900 : 400)
      }
      await sleep(150)
      showCtaButton()
      await sleep(300)
      showInput()

      playing = false
    }

    function applyNavState(_scrolled: boolean, _instant: boolean) {
      navEl.style.opacity = '1'
      navEl.style.transform = 'translateX(-50%)'
      navEl.style.pointerEvents = 'all'
      sidebarPanel.classList.remove('visible')
    }

    if (window.scrollY > 200) applyNavState(true, true)

    playIntro()

    setTimeout(() => {
      navEl.style.animation = ''
      applyNavState(window.scrollY > 200, true)
      requestAnimationFrame(() => {
        navEl.style.transition = 'opacity 0.52s cubic-bezier(.4,0,.2,1), transform 0.52s cubic-bezier(.4,0,.2,1)'
      })
    }, 700)

    const onScroll = () => applyNavState(window.scrollY > 200, false)
    window.addEventListener('scroll', onScroll)

    function triggerEntry(el: HTMLElement, delay: number) {
      setTimeout(() => {
        el.style.animation = 'none'
        el.offsetHeight
        el.style.animation = 'fadeUp 0.6s cubic-bezier(.2,.8,.3,1) forwards'
        setTimeout(() => { el.style.animation = ''; el.style.opacity = '1' }, 650)
      }, delay)
    }

    const hiwObs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return
      hiwObs.disconnect()
      const els = [
        document.querySelector('.hiw-eyebrow') as HTMLElement,
        document.querySelector('.hiw-heading') as HTMLElement,
        document.querySelector('.hiw-sub') as HTMLElement,
      ]
      const steps    = document.querySelectorAll<HTMLElement>('.hiw-step')
      const dividers = document.querySelectorAll<HTMLElement>('.hiw-divider')
      els.forEach((el, i) => triggerEntry(el, i * 100))
      steps.forEach((el, i) => triggerEntry(el, 300 + i * 150))
      dividers.forEach((el, i) => triggerEntry(el, 380 + i * 150))
    }, { threshold: 0.2 })
    hiwObs.observe(document.querySelector('.hiw-section')!)

    const entryObs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return
      entryObs.disconnect()
      triggerEntry(document.querySelector('.entry-eyebrow') as HTMLElement, 0)
      triggerEntry(document.querySelector('.entry-heading') as HTMLElement, 100)
      triggerEntry(document.querySelector('.entry-sub') as HTMLElement, 200)
      document.querySelectorAll<HTMLElement>('.entry-card').forEach((card, i) => triggerEntry(card, 340 + i * 100))
    }, { threshold: 0.2 })
    entryObs.observe(document.querySelector('.entry-section')!)

    const pricingObs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return
      pricingObs.disconnect()
      triggerEntry(document.querySelector('.pricing-eyebrow') as HTMLElement, 0)
      triggerEntry(document.querySelector('.pricing-heading') as HTMLElement, 100)
      triggerEntry(document.querySelector('.pricing-sub') as HTMLElement, 200)
      document.querySelectorAll<HTMLElement>('.pricing-card').forEach((el, i) => triggerEntry(el, 340 + i * 120))
    }, { threshold: 0.15 })
    pricingObs.observe(document.querySelector('.pricing-section')!)

    const monthly = { founder: '$9', partner: '$19', label: '$39', period: '/month' }
    const yearly  = { founder: '$7', partner: '$15', label: '$31', period: '/mo, billed yearly' }

    const toggleMonthly = document.getElementById('toggleMonthly')!
    const toggleYearly  = document.getElementById('toggleYearly')!

    toggleMonthly.addEventListener('click', () => {
      toggleMonthly.classList.add('active')
      toggleYearly.classList.remove('active')
      ;(document.getElementById('founderPrice') as HTMLElement).textContent = monthly.founder
      ;(document.getElementById('partnerPrice') as HTMLElement).textContent = monthly.partner
      ;(document.getElementById('labelPrice') as HTMLElement).textContent = monthly.label
      ;(document.getElementById('founderPeriod') as HTMLElement).textContent = monthly.period
      ;(document.getElementById('partnerPeriod') as HTMLElement).textContent = monthly.period
      ;(document.getElementById('labelPeriod') as HTMLElement).textContent = monthly.period
    })
    toggleYearly.addEventListener('click', () => {
      toggleYearly.classList.add('active')
      toggleMonthly.classList.remove('active')
      ;(document.getElementById('founderPrice') as HTMLElement).textContent = yearly.founder
      ;(document.getElementById('partnerPrice') as HTMLElement).textContent = yearly.partner
      ;(document.getElementById('labelPrice') as HTMLElement).textContent = yearly.label
      ;(document.getElementById('founderPeriod') as HTMLElement).textContent = yearly.period
      ;(document.getElementById('partnerPeriod') as HTMLElement).textContent = yearly.period
      ;(document.getElementById('labelPeriod') as HTMLElement).textContent = yearly.period
    })

    // ---- Hero stitch canvas ----
    ;(function() {
      const canvas = document.getElementById('stitchCanvas') as HTMLCanvasElement
      if (!canvas) return
      const ctx = canvas.getContext('2d')!

      const TOP_SEGS: number[][][] = [
        [[-20, 95],  [85,  125], [175, 125], [280, 95]],
        [[280, 95],  [385,  65], [475,  65], [580, 95]],
        [[580, 95],  [685, 125], [775, 125], [880, 95]],
        [[880, 95],  [985,  65], [1075, 65], [1180, 95]],
        [[1180, 95], [1285, 125],[1375, 125],[1480, 95]],
      ]

      const DASH = 18, GAP = 24, PERIOD = DASH + GAP

      function bez(seg: number[][], t: number): number[] {
        const [p0,c1,c2,p1] = seg, u = 1-t
        return [u*u*u*p0[0]+3*u*u*t*c1[0]+3*u*t*t*c2[0]+t*t*t*p1[0], u*u*u*p0[1]+3*u*u*t*c1[1]+3*u*t*t*c2[1]+t*t*t*p1[1]]
      }
      function bezTan(seg: number[][], t: number): number[] {
        const [p0,c1,c2,p1] = seg, u = 1-t
        return [3*u*u*(c1[0]-p0[0])+6*u*t*(c2[0]-c1[0])+3*t*t*(p1[0]-c2[0]), 3*u*u*(c1[1]-p0[1])+6*u*t*(c2[1]-c1[1])+3*t*t*(p1[1]-c2[1])]
      }
      function buildPath(segs: number[][][]) {
        const pts: {x:number,y:number,angle:number,d:number}[] = []; let len = 0
        for (let i = 0; i <= 3000; i++) {
          const ft = i/3000
          const si = Math.min(Math.floor(ft*segs.length), segs.length-1)
          const lt = ft*segs.length - si
          const [x,y] = bez(segs[si], lt)
          const [dx,dy] = bezTan(segs[si], lt)
          if (i > 0) len += Math.hypot(x-pts[i-1].x, y-pts[i-1].y)
          pts.push({ x, y, angle: Math.atan2(dy,dx), d: len })
        }
        return pts
      }
      function sample(pts: {x:number,y:number,angle:number,d:number}[], d: number) {
        const max = pts[pts.length-1].d
        d = Math.max(0, Math.min(d, max))
        let lo=0, hi=pts.length-1
        while (hi-lo>1) { const mid=(lo+hi)>>1; pts[mid].d<=d?(lo=mid):(hi=mid) }
        const a=pts[lo], b=pts[hi], f=(b.d-a.d)<1e-6?0:(d-a.d)/(b.d-a.d)
        return { x:a.x+(b.x-a.x)*f, y:a.y+(b.y-a.y)*f, angle:a.angle+(b.angle-a.angle)*f }
      }
      function buildMarks(pts: {x:number,y:number,angle:number,d:number}[]) {
        const total=pts[pts.length-1].d, marks=[]
        for (let d=DASH; d-DASH*0.5<=total; d+=PERIOD) marks.push(sample(pts, d-DASH*0.5))
        return marks
      }

      const topPts   = buildPath(TOP_SEGS)
      const topMarks = buildMarks(topPts)

      function drawMark(c: CanvasRenderingContext2D, m: {x:number,y:number,angle:number}, sx: number, sy: number) {
        const half=DASH*0.5, cos=Math.cos(m.angle), sin=Math.sin(m.angle)
        const x1=(m.x+cos*half)*sx, y1=(m.y+sin*half)*sy
        const x2=(m.x-cos*half)*sx, y2=(m.y-sin*half)*sy
        c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2)
        c.strokeStyle='rgba(0,196,180,0.38)'; c.lineWidth=3.5; c.lineCap='butt'; c.stroke()
      }

      let stitchProgress = 0
      function draw() {
        const sx=canvas.width/1440, sy=canvas.height/820
        ctx.clearRect(0,0,canvas.width,canvas.height)
        const tc=Math.floor(topMarks.length*stitchProgress)
        topMarks.slice(0,tc).forEach(m => drawMark(ctx,m,sx,sy))
      }
      function resize() {
        const r=canvas.parentElement!.getBoundingClientRect()
        canvas.width=Math.round(r.width); canvas.height=Math.round(r.height); draw()
      }
      window.addEventListener('resize', resize)
      resize()
      setTimeout(() => {
        const duration=1100; let start: number|null=null
        function step(ts: number) {
          if (!start) start=ts
          const p=Math.min((ts-start)/duration,1)
          stitchProgress=1-Math.pow(1-p,3); draw()
          if (p<1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      }, 150)
    })()

    // ---- Footer stitch canvas ----
    ;(function() {
      const canvas = document.getElementById('stitchFooterCanvas') as HTMLCanvasElement
      if (!canvas) return
      const ctx = canvas.getContext('2d')!
      const isMob = window.innerWidth <= 640
      const SEGS: number[][][] = isMob ? [
        [[-20,55],[360,15],[730,95],[750,55]],
        [[750,55],[770,15],[1110,95],[1460,55]],
      ] : [
        [[-20,55],[85,25],[175,25],[280,55]],
        [[280,55],[385,85],[475,85],[580,55]],
        [[580,55],[685,25],[775,25],[880,55]],
        [[880,55],[985,85],[1075,85],[1180,55]],
        [[1180,55],[1285,25],[1375,25],[1460,55]],
      ]
      const DASH=18, GAP=24, PERIOD=DASH+GAP
      function bez(seg: number[][], t: number): number[] {
        const [p0,c1,c2,p1]=seg, u=1-t
        return [u*u*u*p0[0]+3*u*u*t*c1[0]+3*u*t*t*c2[0]+t*t*t*p1[0],u*u*u*p0[1]+3*u*u*t*c1[1]+3*u*t*t*c2[1]+t*t*t*p1[1]]
      }
      function bezTan(seg: number[][], t: number): number[] {
        const [p0,c1,c2,p1]=seg, u=1-t
        return [3*u*u*(c1[0]-p0[0])+6*u*t*(c2[0]-c1[0])+3*t*t*(p1[0]-c2[0]),3*u*u*(c1[1]-p0[1])+6*u*t*(c2[1]-c1[1])+3*t*t*(p1[1]-c2[1])]
      }
      function buildPath(segs: number[][][]) {
        const pts: {x:number,y:number,angle:number,d:number}[]=[];let len=0
        for (let i=0;i<=3000;i++) {
          const ft=i/3000,si=Math.min(Math.floor(ft*segs.length),segs.length-1),lt=ft*segs.length-si
          const [x,y]=bez(segs[si],lt),[dx,dy]=bezTan(segs[si],lt)
          if (i>0) len+=Math.hypot(x-pts[i-1].x,y-pts[i-1].y)
          pts.push({x,y,angle:Math.atan2(dy,dx),d:len})
        }
        return pts
      }
      function sample(pts: {x:number,y:number,angle:number,d:number}[],d: number) {
        const max=pts[pts.length-1].d; d=Math.max(0,Math.min(d,max))
        let lo=0,hi=pts.length-1
        while (hi-lo>1) {const mid=(lo+hi)>>1; pts[mid].d<=d?(lo=mid):(hi=mid)}
        const a=pts[lo],b=pts[hi],f=(b.d-a.d)<1e-6?0:(d-a.d)/(b.d-a.d)
        return {x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f,angle:a.angle+(b.angle-a.angle)*f}
      }
      function buildMarks(pts: {x:number,y:number,angle:number,d:number}[]) {
        const total=pts[pts.length-1].d,marks=[]
        for (let d=DASH;d-DASH*0.5<=total;d+=PERIOD) marks.push(sample(pts,d-DASH*0.5))
        return marks
      }
      const marks=buildMarks(buildPath(SEGS)); let progress=0
      function draw() {
        const sx=canvas.width/1440,sy=canvas.height/110
        ctx.clearRect(0,0,canvas.width,canvas.height)
        const count=Math.floor(marks.length*progress)
        marks.slice(0,count).forEach(m => {
          const half=DASH*0.5,cos=Math.cos(m.angle),sin=Math.sin(m.angle)
          const x1=(m.x+cos*half)*sx,y1=(m.y+sin*half)*sy,x2=(m.x-cos*half)*sx,y2=(m.y-sin*half)*sy
          ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2)
          ctx.strokeStyle='rgba(0,196,180,0.38)';ctx.lineWidth=3.5;ctx.lineCap='butt';ctx.stroke()
        })
      }
      function resize() {
        const r=canvas.parentElement!.getBoundingClientRect()
        canvas.width=Math.round(r.width);canvas.height=Math.round(r.height);draw()
      }
      window.addEventListener('resize',resize);resize()
      const obs=new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return; obs.disconnect()
        const duration=1100;let start: number|null=null
        function step(ts: number) {
          if (!start) start=ts
          const p=Math.min((ts-start)/duration,1);progress=1-Math.pow(1-p,3);draw()
          if (p<1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      },{threshold:0.3})
      obs.observe(canvas.parentElement!)
    })()

    // ---- Section stitch dividers ----
    ;(function() {
      const DASH=18,GAP=32,PERIOD=DASH+GAP,H=110
      const SEGS_0 = [
        [[-20,H*0.50],[360,H*0.10],[720,H*0.10],[740,H*0.50]],
        [[740,H*0.50],[760,H*0.90],[1100,H*0.90],[1460,H*0.50]],
      ]
      const SEGS_1 = [
        [[-20,H*0.50],[180,H*0.04],[550,H*0.04],[730,H*0.50]],
        [[730,H*0.50],[960,H*0.72],[1240,H*0.72],[1460,H*0.50]],
      ]
      const SEGS_2 = [
        [[-20,H*0.50],[140,H*0.08],[340,H*0.08],[480,H*0.50]],
        [[480,H*0.50],[640,H*0.92],[840,H*0.92],[980,H*0.50]],
        [[980,H*0.50],[1140,H*0.08],[1340,H*0.08],[1460,H*0.50]],
      ]
      const ALL_SEGS = [SEGS_0,SEGS_1,SEGS_2]
      function bez(seg: number[][], t: number): number[] {
        const [p0,c1,c2,p1]=seg,u=1-t
        return [u*u*u*p0[0]+3*u*u*t*c1[0]+3*u*t*t*c2[0]+t*t*t*p1[0],u*u*u*p0[1]+3*u*u*t*c1[1]+3*u*t*t*c2[1]+t*t*t*p1[1]]
      }
      function bezTan(seg: number[][], t: number): number[] {
        const [p0,c1,c2,p1]=seg,u=1-t
        return [3*u*u*(c1[0]-p0[0])+6*u*t*(c2[0]-c1[0])+3*t*t*(p1[0]-c2[0]),3*u*u*(c1[1]-p0[1])+6*u*t*(c2[1]-c1[1])+3*t*t*(p1[1]-c2[1])]
      }
      function buildPath(segs: number[][][]) {
        const pts: {x:number,y:number,angle:number,d:number}[]=[];let len=0
        for (let i=0;i<=3000;i++) {
          const ft=i/3000,si=Math.min(Math.floor(ft*segs.length),segs.length-1),lt=ft*segs.length-si
          const [x,y]=bez(segs[si],lt),[dx,dy]=bezTan(segs[si],lt)
          if (i>0) len+=Math.hypot(x-pts[i-1].x,y-pts[i-1].y)
          pts.push({x,y,angle:Math.atan2(dy,dx),d:len})
        }
        return pts
      }
      function sample(pts: {x:number,y:number,angle:number,d:number}[],d: number) {
        const max=pts[pts.length-1].d; d=Math.max(0,Math.min(d,max))
        let lo=0,hi=pts.length-1
        while (hi-lo>1) {const mid=(lo+hi)>>1; pts[mid].d<=d?(lo=mid):(hi=mid)}
        const a=pts[lo],b=pts[hi],f=(b.d-a.d)<1e-6?0:(d-a.d)/(b.d-a.d)
        return {x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f,angle:a.angle+(b.angle-a.angle)*f}
      }
      function buildMarks(pts: {x:number,y:number,angle:number,d:number}[]) {
        const total=pts[pts.length-1].d,marks=[]
        for (let d=DASH;d-DASH*0.5<=total;d+=PERIOD) marks.push(sample(pts,d-DASH*0.5))
        return marks
      }
      const allMarks=ALL_SEGS.map(segs => buildMarks(buildPath(segs)))
      document.querySelectorAll<HTMLCanvasElement>('.stitch-divider canvas').forEach((canvas,idx) => {
        const ctx=canvas.getContext('2d')!
        const marks=allMarks[idx%allMarks.length]; let progress=0
        function draw() {
          const sx=canvas.width/1440,sy=canvas.height/H
          ctx.clearRect(0,0,canvas.width,canvas.height)
          const count=Math.floor(marks.length*progress)
          marks.slice(0,count).forEach(m => {
            const half=DASH*0.5,cos=Math.cos(m.angle),sin=Math.sin(m.angle)
            ctx.beginPath()
            ctx.moveTo((m.x+cos*half)*sx,(m.y+sin*half)*sy)
            ctx.lineTo((m.x-cos*half)*sx,(m.y-sin*half)*sy)
            ctx.strokeStyle='rgba(0,196,180,0.38)';ctx.lineWidth=3.5;ctx.lineCap='butt';ctx.stroke()
          })
        }
        function resize() {
          const r=canvas.parentElement!.getBoundingClientRect()
          canvas.width=Math.round(r.width);canvas.height=Math.round(r.height);draw()
        }
        window.addEventListener('resize',resize);resize()
        const obs=new IntersectionObserver(entries => {
          if (!entries[0].isIntersecting) return; obs.disconnect()
          const duration=900;let start: number|null=null
          function step(ts: number) {
            if (!start) start=ts
            const p=Math.min((ts-start)/duration,1);progress=1-Math.pow(1-p,3);draw()
            if (p<1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        },{threshold:0.3})
        obs.observe(canvas.parentElement!)
      })
    })()

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <>
      <style>{pageStyles}</style>

      <section className="hero">
        <canvas id="stitchCanvas" aria-hidden="true" />

        <nav className="nav">
          <a href="#" className="wordmark" onClick={(e) => { e.preventDefault(); window.scrollTo({top:0,behavior:'smooth'}) }}>
            sartile<span className="wm-dot-com">.com</span>
          </a>
          <div className="nav-links">
            <a href="#how-we-work">How it works</a>
            <a href="/app">Dashboard</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className="nav-right">
            {authedUser ? (
              <div className="nav-profile-wrap" ref={dropdownRef}>
                <button
                  className="nav-profile-btn"
                  onClick={() => setDropdownOpen(o => !o)}
                  aria-label="Account menu"
                >
                  {(authedUser.name || authedUser.email)[0].toUpperCase()}
                </button>
                <div className={`nav-profile-dropdown ${dropdownOpen ? 'open' : ''}`}>
                  <a href="/app" className="nav-profile-dropdown-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                    </svg>
                    Dashboard
                  </a>
                  <a href="/app" className="nav-profile-dropdown-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                    Your Roadmap
                  </a>
                  <div className="nav-profile-dropdown-sep" />
                  <a href="/onboarding" className="nav-profile-dropdown-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    New Roadmap
                  </a>
                </div>
              </div>
            ) : (
              <a href="/login" className="nav-login">Log in</a>
            )}
            {authedUser && userPlan && userPlan !== 'absent' ? (
              <span className={`nav-plan-label ${userPlan}`}>
                {userPlan === 'student' ? 'Free' : userPlan === 'founder' ? 'Founder' : userPlan === 'label' ? 'Label' : 'Partner'}
              </span>
            ) : (
              <button className="nav-cta" onClick={() => window.location.href = '/signup'}>Start for free</button>
            )}
          </div>
        </nav>

        <div className="stage">
          <div className="eyebrow">Where brands are born</div>
          <h1 className="hero-headline">Your co-partner for building the clothing brand you actually want.</h1>
          <p className="subhead">sartile knows your brand, tracks where you are, and tells you exactly what to do next. Built for founders who are serious about making it.</p>
          <div className="chat" id="chat">
            <div className="chat-head">
              <span className="dot-live"></span>
              <span className="label">sarti is online</span>
            </div>
            <div className="thread" id="thread"></div>
          </div>
        </div>
      </section>

      <div className="stitch-divider" aria-hidden="true"><canvas /></div>

      <div className="sidebar-panel" id="sidebarPanel">
        <a href="#" className="sidebar-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({top:0,behavior:'smooth'}) }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
          </svg>
        </a>
        <div className="sidebar-sep" aria-hidden="true"></div>
        <a href="#" className="sidebar-item" data-tip="Home" onClick={(e) => { e.preventDefault(); window.scrollTo({top:0,behavior:'smooth'}) }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
        </a>
        <a href="#how-we-work" className="sidebar-item" data-tip="How we work">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </a>
        <a href="#pricing" className="sidebar-item" data-tip="Pricing">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
        </a>
        <a href={authedUser ? '/app' : '/login'} className="sidebar-item" data-tip={authedUser ? 'Dashboard' : 'Log in'}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </a>
      </div>

      <section className="hiw-section" id="how-we-work">
        <div className="hiw-container">
          <p className="hiw-eyebrow">How Sartile Works</p>
          <h2 className="hiw-heading">Simple. Personal. Always on.</h2>
          <p className="hiw-sub">sartile is built around you, not the other way around.</p>
          <div className="hiw-steps">
            <div className="hiw-step">
              <span className="hiw-num">01</span>
              <h3 className="hiw-title">Tell us where you are</h3>
              <p className="hiw-desc">Tell sartile where your brand is right now and where you want to take it. Starting from zero or already have something running. That's your starting point.</p>
            </div>
            <div className="hiw-divider" aria-hidden="true"></div>
            <div className="hiw-step">
              <span className="hiw-num">02</span>
              <h3 className="hiw-title">Get your roadmap</h3>
              <p className="hiw-desc">sartile builds a personal plan around your brand, your audience, and where you want to go. Not a generic checklist. A step-by-step path made for you.</p>
            </div>
            <div className="hiw-divider" aria-hidden="true"></div>
            <div className="hiw-step">
              <span className="hiw-num">03</span>
              <h3 className="hiw-title">Build with a partner</h3>
              <p className="hiw-desc">sartile walks with you the whole way. It checks in as you hit milestones, introduces the right tools at the right time, and is always there when you have a question.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="stitch-divider" aria-hidden="true"><canvas /></div>

      <section className="entry-section">
        <div className="entry-container">
          <p className="entry-eyebrow">Where is your brand right now?</p>
          <h2 className="entry-heading">Pick your stage.</h2>
          <p className="entry-sub">From first idea to scaling an existing brand — sartile meets you exactly where you are and skips everything you've already done.</p>
          <div className="entry-grid">
            <div className="entry-card">
              <div className="entry-icon-wrap">
                <svg className="entry-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5C17.6 10.3 18 9.2 18 8A6 6 0 1 0 6 8c0 1.2.4 2.3 1.5 3.5C8.3 12.3 8.8 13 9 14"/>
                  <line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="21" x2="14" y2="21"/>
                </svg>
              </div>
              <span className="entry-num">01</span>
              <h3 className="entry-title">It's just an idea</h3>
              <p className="entry-desc">You know the direction and maybe the aesthetic, but nothing is designed yet. sartile helps you name the brand, shape the concept, and connect you to the right tools to bring it to life.</p>
              <a href="/onboarding?start=idea" className="entry-btn">Start here <span>→</span></a>
            </div>
            <div className="entry-card">
              <div className="entry-icon-wrap">
                <svg className="entry-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                </svg>
              </div>
              <span className="entry-num">02</span>
              <h3 className="entry-title">I have a design</h3>
              <p className="entry-desc">The artwork is ready. Skip step one. sartile moves straight to mockups, product selection, and building out your audience profile so you know exactly who you're selling to.</p>
              <a href="/onboarding?start=design" className="entry-btn">Start here <span>→</span></a>
            </div>
            <div className="entry-card">
              <div className="entry-icon-wrap">
                <svg className="entry-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/>
                </svg>
              </div>
              <span className="entry-num">03</span>
              <h3 className="entry-title">I have a mockup</h3>
              <p className="entry-desc">You can see what the product looks like. Now it is about the store, the pricing, the platform, and a marketing plan that actually fits your brand and your audience.</p>
              <a href="/onboarding?start=mockup" className="entry-btn">Start here <span>→</span></a>
            </div>
            <div className="entry-card">
              <div className="entry-icon-wrap">
                <svg className="entry-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
              </div>
              <span className="entry-num">04</span>
              <h3 className="entry-title">I'm ready to sell</h3>
              <p className="entry-desc">Everything is in place. sartile builds the full launch strategy. Where to post, what to say, when to say it, and which platforms actually matter for your specific brand.</p>
              <a href="/onboarding?start=sell" className="entry-btn">Start here <span>→</span></a>
            </div>

            <div className="entry-card entry-card-wide">
              <div className="entry-icon-wrap">
                <svg className="entry-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
              </div>
              <span className="entry-num">05</span>
              <h3 className="entry-title">I'm already selling and want to grow</h3>
              <p className="entry-desc">You have a brand running and orders coming in — but you want more. sartile analyzes what's working, identifies the gaps, and builds a growth strategy around your real data and where you want to take the brand next.</p>
              <a href="/onboarding?start=scaling" className="entry-btn">Start here <span>→</span></a>
            </div>
          </div>
        </div>
      </section>

      <div className="stitch-divider" aria-hidden="true"><canvas /></div>

      <section className="pricing-section" id="pricing">
        <div className="pricing-container">
          <p className="pricing-eyebrow">Pricing</p>
          <h2 className="pricing-heading">Plans and Pricing</h2>
          <p className="pricing-sub">Whether you are just starting out or already making moves, there is a plan built for where you are.</p>
          <div className="pricing-toggle-wrap">
            <button className="toggle-btn active" id="toggleMonthly">Monthly</button>
            <button className="toggle-btn" id="toggleYearly">Yearly <span className="save-badge">Save 20%</span></button>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-card-top">
                <p className="plan-name">Student</p>
                <p className="plan-desc">For getting started with zero commitment.</p>
                <div className="plan-price"><span className="plan-amount">Free</span></div>
              </div>
              <ul className="plan-features">
                <li><span className="check">✓</span> 5 messages/day</li>
                <li><span className="check">✓</span> Adaptive onboarding</li>
                <li><span className="check">✓</span> Personalized roadmap in chat</li>
                <li><span className="check">✓</span> Tool links and guidance</li>
                <li><span className="check">✓</span> Sarti co-partner chat</li>
              </ul>
              <a href="/signup?plan=student" className="plan-btn">Get started for free</a>
            </div>
            <div className="pricing-card">
              <div className="pricing-card-top">
                <p className="plan-name">Founder</p>
                <p className="plan-desc">For founders ready to build seriously.</p>
                <div className="plan-price">
                  <span className="plan-amount" id="founderPrice">$9</span>
                  <span className="plan-period" id="founderPeriod">/month</span>
                </div>
              </div>
              <ul className="plan-features">
                <li><span className="check">✓</span> 15 messages/day</li>
                <li><span className="check">✓</span> Everything in Student</li>
                <li><span className="check">✓</span> Deeper roadmap checkpoints</li>
                <li><span className="check">✓</span> Marketing plan guidance</li>
                <li><span className="check">✓</span> Tool links with affiliate perks</li>
                <li><span className="check">✓</span> Weekly progress check-ins</li>
              </ul>
              <a href="/signup?plan=founder" className="plan-btn">Start building</a>
            </div>
            <div className="pricing-card pricing-card-partner">
              <div className="pricing-card-top">
                <div className="plan-header">
                  <p className="plan-name">Partner</p>
                  <div className="plan-badge">Most popular</div>
                </div>
                <p className="plan-desc">For brands that are ready to grow fast.</p>
                <div className="plan-price">
                  <span className="plan-amount" id="partnerPrice">$19</span>
                  <span className="plan-period" id="partnerPeriod">/month</span>
                </div>
              </div>
              <ul className="plan-features">
                <li><span className="check">✓</span> 50 messages/day</li>
                <li><span className="check">✓</span> Everything in Founder</li>
                <li><span className="check">✓</span> Image uploads — 5/day</li>
                <li><span className="check">✓</span> Show sarti your product, design, or content</li>
                <li><span className="check">✓</span> Daily check-ins</li>
                <li><span className="check">✓</span> Ad guidance + competitor analysis</li>
                <li><span className="check">✓</span> 30-day content calendar</li>
                <li><span className="check">✓</span> UGC connector</li>
              </ul>
              <a href="/signup?plan=partner" className="plan-btn">Go all in</a>
            </div>
            <div className="pricing-card pricing-card-label">
              <div className="pricing-card-top">
                <div className="plan-header">
                  <p className="plan-name">Label</p>
                  <div className="plan-badge">Top tier</div>
                </div>
                <p className="plan-desc">For founders running a serious brand.</p>
                <div className="plan-price">
                  <span className="plan-amount" id="labelPrice">$39</span>
                  <span className="plan-period" id="labelPeriod">/month</span>
                </div>
              </div>
              <ul className="plan-features">
                <li><span className="check">✓</span> 150 messages/day</li>
                <li><span className="check">✓</span> Everything in Partner</li>
                <li><span className="check">✓</span> 30 image uploads/day</li>
                <li><span className="check">✓</span> AI image generation — 5/day</li>
                <li><span className="check">✓</span> Weekly brand report from sarti</li>
                <li><span className="check">✓</span> Influencer outreach scripts</li>
              </ul>
              <a href="/signup?plan=label" className="plan-btn">Launch your label</a>
            </div>
          </div>
        </div>
      </section>

      <div className="stitch-footer">
        <canvas id="stitchFooterCanvas" aria-hidden="true" />
      </div>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-wordmark">sartile<span className="wm-dot-com">.com</span></div>
              <p className="footer-tagline">Where brands are born.</p>
            </div>
            <div className="footer-cols">
              <div className="footer-col">
                <h4>Product</h4>
                <ul>
                  <li><a href="#how-we-work">How it works</a></li>
                  <li><a href="#pricing">Pricing</a></li>
                  <li><a href="/faq">FAQ</a></li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Start</h4>
                <ul>
                  <li><a href="/onboarding?start=idea">Just an idea</a></li>
                  <li><a href="/onboarding?start=design">I have a design</a></li>
                  <li><a href="/onboarding?start=mockup">I have a mockup</a></li>
                  <li><a href="/onboarding?start=sell">Ready to sell</a></li>
                  <li><a href="/onboarding?start=scaling">Already selling</a></li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Account</h4>
                <ul>
                  <li><a href="/login">Log in</a></li>
                  <li><a href="/signup">Sign up free</a></li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Legal</h4>
                <ul>
                  <li><a href="/privacy">Privacy Policy</a></li>
                  <li><a href="/terms">Terms of Service</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-sep"></div>
          <div className="footer-bottom">
            <p className="footer-copy">© 2026 Sartile. All rights reserved.</p>
            <div className="footer-socials">
              <a href="https://tiktok.com" className="footer-social" aria-label="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
                </svg>
              </a>
              <a href="https://instagram.com" className="footer-social" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
