'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AnalyticsPanel from '@/components/panels/AnalyticsPanel'
import AudiencePanel from '@/components/panels/AudiencePanel'
import DesignsPanel from '@/components/panels/DesignsPanel'
import MarketingPanel from '@/components/panels/MarketingPanel'

const PLANS = [
  { id: 'student', label: 'Student', price: 'Free', questions: '5 messages/day', color: '#7A8BA8' },
  { id: 'founder', label: 'Founder', price: '$9/mo', questions: '15 messages/day', color: '#1C2B4A' },
  { id: 'partner', label: 'Partner', price: '$19/mo', questions: '50 messages/day + images', color: '#00C4B4' },
  { id: 'label', label: 'Label', price: '$39/mo', questions: '150 messages/day + 30 images + AI generation', color: '#8B5CF6' },
  { id: 'absent', label: 'Absent', price: '—', questions: 'No access', color: '#C8D8EC' },
]

type Question = {
  id: string
  q: string | ((answers: string[]) => string)
  options: string[]
  helpBtn?: string
  multiSelect?: boolean
}

const QUESTIONS: Question[] = [
  {
    id: 'platform',
    q: "What platform are you planning to sell on?",
    options: ["Shopify", "Etsy", "Depop", "TikTok Shop", "My own site", "Amazon", "Not sure yet", "Other"],
    multiSelect: true,
  },
  {
    id: 'production',
    q: (answers) => answers[0] === 'Etsy' || answers[0] === 'Depop'
      ? "Making things yourself or going print on demand?"
      : "Print on demand or handling inventory yourself?",
    options: ["Print on demand", "Own inventory", "Making it myself", "Dropshipping", "Not sure yet", "Other"],
  },
  {
    id: 'audience',
    q: "Any idea who you're targeting?",
    options: ["Teens (13–17)", "Young adults (18–24)", "25+", "Mixed ages", "Other"],
    helpBtn: "Help me find my audience",
  },
  {
    id: 'content',
    q: (answers) => answers[0] === 'TikTok Shop'
      ? "Besides TikTok — where else are you posting?"
      : "Where are you putting content out?",
    options: ["TikTok", "Instagram", "YouTube Shorts", "Pinterest", "Not posting yet", "Other"],
    multiSelect: true,
  },
  {
    id: 'designs',
    q: "How far along are your designs?",
    options: ["Just an idea", "Have sketches", "Designs done", "Have mockups", "Other"],
  },
]

const pageStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --frost: #F6F8FC; --slate: #1C2B4A; --teal: #00C4B4;
    --white: #FFFFFF; --frost-blue: #C8D8EC; --muted-slate: #7A8BA8;
  }
  html, body { height: 100%; }
  body { font-family: 'Outfit', sans-serif; background: var(--frost); color: var(--slate); -webkit-font-smoothing: antialiased; }

  .app-layout { display: flex; height: 100vh; overflow: hidden; }

  .app-sidebar {
    width: 260px; flex-shrink: 0;
    background: var(--white); border-right: 1px solid var(--frost-blue);
    display: flex; flex-direction: column; padding: 24px 16px; gap: 8px;
  }
  .app-wordmark { font-weight: 700; font-size: 22px; letter-spacing: -0.025em; color: var(--slate); text-decoration: none; padding: 8px 12px; display: block; margin-bottom: 16px; }
  .app-wordmark span { color: var(--teal); }
  .sidebar-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
  .sidebar-link {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px;
    font-weight: 600; font-size: 14px; color: var(--muted-slate);
    text-decoration: none; cursor: pointer; border: none; background: none;
    width: 100%; text-align: left;
    transition: background 0.15s ease, color 0.15s ease;
  }
  .sidebar-link:hover { background: var(--frost); color: var(--slate); }
  .sidebar-link.active { background: rgba(0,196,180,0.08); color: var(--teal); }
  .sidebar-link svg { width: 17px; height: 17px; flex-shrink: 0; }
  .sidebar-section-label { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted-slate); padding: 12px 12px 4px; }
  .sidebar-brand {
    display: flex; align-items: center; gap: 9px;
    padding: 9px 12px; border-radius: 10px;
    font-weight: 600; font-size: 13.5px; color: var(--muted-slate);
    text-decoration: none; cursor: pointer; border: none; background: none;
    width: 100%; text-align: left; transition: background 0.15s ease, color 0.15s ease;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .sidebar-brand:hover { background: var(--frost); color: var(--slate); }
  .sidebar-brand.active { background: rgba(0,196,180,0.07); color: var(--slate); }
  .sidebar-brand-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--frost-blue); flex-shrink: 0; transition: background 0.15s ease; }
  .sidebar-brand.active .sidebar-brand-dot { background: var(--teal); }

  .sidebar-bottom { margin-top: auto; padding-top: 16px; border-top: 1px solid var(--frost-blue); display: flex; flex-direction: column; gap: 4px; }
  .user-chip {
    display: flex; align-items: center; gap: 10px; padding: 10px 12px;
    border-radius: 10px; background: var(--frost);
    cursor: pointer; border: 1.5px solid transparent;
    transition: border-color 0.15s ease, background 0.15s ease;
  }
  .user-chip:hover { border-color: var(--frost-blue); background: var(--white); }
  .user-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--teal); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; color: var(--white); flex-shrink: 0; }
  .user-info { flex: 1; min-width: 0; }
  .user-name { font-weight: 600; font-size: 13px; color: var(--slate); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .plan-badge {
    font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
    padding: 2px 7px; border-radius: 999px; display: inline-block; margin-top: 2px;
  }
  .plan-badge.student { background: rgba(122,139,168,0.12); color: var(--muted-slate); }
  .plan-badge.founder { background: rgba(28,43,74,0.1); color: var(--slate); }
  .plan-badge.partner { background: rgba(0,196,180,0.12); color: var(--teal); }
  .plan-badge.label { background: rgba(139,92,246,0.12); color: #8B5CF6; }
  .plan-badge.absent { background: rgba(200,216,236,0.4); color: var(--muted-slate); font-style: italic; }
  .chip-edit-icon { width: 14px; height: 14px; color: var(--muted-slate); flex-shrink: 0; }

  /* Plan modal */
  .plan-overlay {
    position: fixed; inset: 0; z-index: 500;
    background: rgba(28,43,74,0.28); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  .plan-modal {
    background: var(--white); border-radius: 24px;
    padding: 32px; width: 100%; max-width: 440px;
    box-shadow: 0 32px 80px -20px rgba(28,43,74,0.28);
    display: flex; flex-direction: column; gap: 24px;
  }
  .plan-modal-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
  .plan-modal-title { font-weight: 800; font-size: 22px; letter-spacing: -0.025em; color: var(--slate); }
  .plan-modal-sub { font-size: 14px; color: var(--muted-slate); margin-top: 4px; line-height: 1.5; }
  .plan-modal-close {
    width: 32px; height: 32px; border-radius: 10px; border: 1.5px solid var(--frost-blue);
    background: var(--frost); cursor: pointer; display: flex; align-items: center; justify-content: center;
    color: var(--muted-slate); font-size: 18px; line-height: 1; flex-shrink: 0;
    transition: background 0.15s ease, color 0.15s ease;
  }
  .plan-modal-close:hover { background: var(--frost-blue); color: var(--slate); }
  .plan-cards { display: flex; flex-direction: column; gap: 10px; }
  .plan-card {
    display: flex; align-items: center; gap: 14px;
    padding: 16px 18px; border-radius: 14px;
    border: 1.5px solid var(--frost-blue); background: var(--frost);
    cursor: pointer; transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
  }
  .plan-card:hover { border-color: rgba(0,196,180,0.4); background: var(--white); }
  .plan-card.active { border-color: var(--teal); background: rgba(0,196,180,0.04); box-shadow: 0 0 0 3px rgba(0,196,180,0.12); }
  .plan-card-dot { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--frost-blue); flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: border-color 0.18s ease; }
  .plan-card.active .plan-card-dot { border-color: var(--teal); background: var(--teal); }
  .plan-card.active .plan-card-dot::after { content: ''; display: block; width: 6px; height: 6px; border-radius: 50%; background: var(--white); }
  .plan-card-info { flex: 1; }
  .plan-card-name { font-weight: 700; font-size: 15px; color: var(--slate); }
  .plan-card-questions { font-size: 12px; color: var(--muted-slate); margin-top: 1px; }
  .plan-card-price { font-weight: 700; font-size: 15px; color: var(--slate); }
  .plan-save-btn {
    display: flex; align-items: center; justify-content: center;
    font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 15px;
    color: var(--white); background: var(--slate); border: none; border-radius: 12px;
    padding: 14px; cursor: pointer; width: 100%;
    transition: background 0.18s ease;
  }
  .plan-save-btn:hover { background: #16233d; }
  .plan-save-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .plan-admin-note { font-size: 12px; color: var(--muted-slate); text-align: center; }

  .app-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

  .chat-view { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .chat-header {
    padding: 16px 28px; border-bottom: 1px solid var(--frost-blue);
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0; background: var(--white);
  }
  .chat-header-left { display: flex; align-items: center; gap: 12px; }
  .chat-status-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--teal); box-shadow: 0 0 0 4px rgba(0,196,180,0.18); flex-shrink: 0; }
  .chat-header-name { font-weight: 700; font-size: 16px; color: var(--slate); }
  .chat-header-sub { font-size: 13px; color: var(--muted-slate); margin-left: 4px; }
  .msg-counter {
    font-size: 12px; font-weight: 600; color: var(--muted-slate);
    background: var(--frost); border: 1px solid var(--frost-blue);
    padding: 5px 12px; border-radius: 999px; white-space: nowrap;
    transition: color 0.2s ease, border-color 0.2s ease;
  }
  .msg-counter.low { color: #D97706; border-color: rgba(217,119,6,0.3); background: rgba(217,119,6,0.06); }
  .msg-counter.zero { color: #DC2626; border-color: rgba(220,38,38,0.3); background: rgba(220,38,38,0.06); }

  .chat-thread { flex: 1; overflow-y: auto; padding: 28px; display: flex; flex-direction: column; gap: 20px; scroll-behavior: smooth; }
  .chat-thread::-webkit-scrollbar { width: 6px; }
  .chat-thread::-webkit-scrollbar-track { background: transparent; }
  .chat-thread::-webkit-scrollbar-thumb { background: var(--frost-blue); border-radius: 3px; }

  .msg-row { display: flex; align-items: flex-end; gap: 12px; max-width: 740px; }
  .msg-row.user { justify-content: flex-end; margin-left: auto; }
  .msg-avatar { width: 36px; height: 36px; flex-shrink: 0; }
  .msg-avatar svg { width: 100%; height: 100%; }
  .msg-bubble {
    background: linear-gradient(145deg, #00BFB4 0%, #009E92 100%);
    color: var(--white); font-size: 15px; line-height: 1.65;
    padding: 14px 18px; border-radius: 18px 18px 18px 6px;
    max-width: 560px; box-shadow: 0 3px 8px -4px rgba(0,140,128,0.20);
  }
  .msg-bubble.user {
    background: var(--white); color: var(--slate);
    border: 1px solid var(--frost-blue); border-radius: 18px 18px 6px 18px; box-shadow: none;
  }
  .msg-bubble p + p { margin-top: 10px; }
  .msg-bubble strong { font-weight: 700; }
  .msg-bubble a { color: var(--white); font-weight: 600; text-decoration: underline; text-decoration-color: rgba(255,255,255,0.6); text-underline-offset: 2px; }
  .msg-bubble a:hover { text-decoration-color: rgba(255,255,255,1); }
  .msg-bubble.user a { color: var(--teal); text-decoration-color: rgba(0,196,180,0.5); }
  .msg-bubble.user a:hover { text-decoration-color: var(--teal); }
  .msg-bubble ul, .msg-bubble ol { padding-left: 18px; margin-top: 8px; display: flex; flex-direction: column; gap: 4px; }
  .msg-img-preview { max-width: 200px; border-radius: 12px; display: block; margin-bottom: 8px; }

  .typing-row { display: flex; align-items: flex-end; gap: 12px; }
  .typing-dots { background: var(--frost); border: 1px solid var(--frost-blue); border-radius: 18px 18px 18px 6px; padding: 15px 18px; display: flex; gap: 5px; }
  .typing-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--muted-slate); animation: blink 1.3s infinite ease-in-out both; }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes blink { 0%,80%,100%{opacity:0.25;transform:scale(0.85)} 40%{opacity:1;transform:scale(1)} }

  .limit-banner {
    margin: 0 28px 16px; padding: 14px 18px;
    background: rgba(28,43,74,0.05); border: 1px solid var(--frost-blue);
    border-radius: 12px; font-size: 14px; color: var(--muted-slate);
  }
  .limit-banner a { color: var(--teal); font-weight: 600; text-decoration: none; cursor: pointer; }

  .chat-input-area { padding: 12px 28px 20px; border-top: 1px solid var(--frost-blue); background: var(--white); flex-shrink: 0; }
  .image-preview-strip { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .image-preview-thumb { width: 56px; height: 56px; border-radius: 10px; object-fit: cover; border: 1.5px solid var(--frost-blue); }
  .image-preview-remove {
    width: 24px; height: 24px; border-radius: 999px; border: none;
    background: rgba(28,43,74,0.1); cursor: pointer; font-size: 14px; line-height: 1;
    display: flex; align-items: center; justify-content: center; color: var(--slate);
    transition: background 0.15s ease;
  }
  .image-preview-remove:hover { background: rgba(28,43,74,0.18); }
  .chat-input-wrap { display: flex; gap: 10px; align-items: flex-end; }
  .chat-textarea {
    flex: 1; padding: 13px 16px; border-radius: 14px;
    background: var(--frost); border: 1.5px solid var(--frost-blue);
    font-family: 'Outfit', sans-serif; font-size: 15px; color: var(--slate);
    line-height: 1.5; resize: none; outline: none; min-height: 48px; max-height: 140px;
    transition: border-color 0.2s ease;
  }
  .chat-textarea:focus { border-color: var(--teal); }
  .chat-textarea::placeholder { color: var(--muted-slate); }
  .chat-textarea:disabled { opacity: 0.5; }
  .img-btn {
    width: 44px; height: 44px; border-radius: 12px; background: var(--frost);
    border: 1.5px solid var(--frost-blue); cursor: pointer;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    color: var(--muted-slate); transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease;
  }
  .img-btn:hover { border-color: var(--teal); color: var(--teal); background: rgba(0,196,180,0.06); }
  .img-btn svg { width: 18px; height: 18px; }
  .send-btn {
    width: 44px; height: 44px; border-radius: 12px; background: var(--slate); color: var(--white);
    border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: background 0.18s ease, transform 0.15s ease;
  }
  .send-btn:hover { background: #16233d; transform: translateY(-1px); }
  .send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .send-btn svg { width: 18px; height: 18px; }

  .question-chips { display: flex; flex-wrap: wrap; gap: 10px; padding: 0 28px 20px; align-items: center; }
  .question-chip {
    font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 14px;
    color: var(--slate); background: var(--white);
    border: 1.5px solid var(--frost-blue); border-radius: 999px;
    padding: 10px 20px; cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease, transform 0.12s ease;
  }
  .question-chip:hover { border-color: var(--teal); background: rgba(0,196,180,0.06); color: var(--teal); transform: translateY(-1px); }
  .question-chip:active { transform: translateY(0); }
  .question-chip.selected { border-color: var(--teal); background: rgba(0,196,180,0.12); color: var(--teal); }
  .question-chip-done {
    font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 14px;
    color: var(--white); background: var(--slate); border: none;
    border-radius: 999px; padding: 10px 22px; cursor: pointer;
    transition: background 0.15s ease, transform 0.12s ease;
  }
  .question-chip-done:hover { background: #16233d; transform: translateY(-1px); }
  .question-chip-done:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .question-chip-other { color: var(--muted-slate); border-style: dashed; }
  .question-chip-other:hover { color: var(--slate); border-style: solid; }
  .question-chip-help {
    color: var(--teal); border-color: rgba(0,196,180,0.35); background: rgba(0,196,180,0.04);
  }
  .question-chip-help:hover { background: rgba(0,196,180,0.1); border-color: var(--teal); color: var(--teal); }
  .other-input-row { display: flex; align-items: center; gap: 8px; width: 100%; margin-top: 4px; }
  .other-input {
    flex: 1; padding: 10px 16px; border-radius: 12px;
    background: var(--white); border: 1.5px solid var(--teal);
    font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 500; color: var(--slate);
    outline: none; max-width: 360px;
  }
  .other-input::placeholder { color: var(--muted-slate); }
  .other-input-submit {
    width: 38px; height: 38px; border-radius: 10px;
    background: var(--teal); border: none; color: var(--white);
    font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: background 0.15s ease; flex-shrink: 0;
  }
  .other-input-submit:hover { background: #00aaa0; }
  .other-input-submit:disabled { opacity: 0.35; cursor: not-allowed; }

  .mobile-header { display: none; padding: 16px 20px; background: var(--white); border-bottom: 1px solid var(--frost-blue); align-items: center; justify-content: space-between; }
  @media (max-width: 768px) {
    .app-sidebar { display: none; }
    .mobile-header { display: flex; }
    .chat-thread { padding: 20px 16px; }
    .chat-input-area { padding: 10px 16px 18px; }
    .chat-header { padding: 14px 16px; }
    .plan-modal { padding: 24px; }
  }

  /* Panel pages */
  .panel-view { flex: 1; overflow-y: auto; padding: 36px 44px; display: flex; flex-direction: column; gap: 32px; }
  .panel-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
  .panel-title { font-weight: 800; font-size: 26px; letter-spacing: -0.025em; color: var(--slate); }
  .panel-sub { font-size: 14px; color: var(--muted-slate); margin-top: 4px; line-height: 1.55; }
  .panel-section { display: flex; flex-direction: column; gap: 14px; }
  .panel-section-title { font-weight: 700; font-size: 14px; color: var(--slate); letter-spacing: -0.01em; }

  .panel-cta-btn {
    font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 14px;
    color: var(--white); background: var(--slate); border: none; border-radius: 10px;
    padding: 11px 20px; cursor: pointer; transition: background 0.15s ease;
    white-space: nowrap; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
  }
  .panel-cta-btn:hover { background: #16233d; }
  .panel-cta-btn.teal { background: var(--teal); }
  .panel-cta-btn.teal:hover { background: #00aaa0; }

  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .stat-card { background: var(--white); border: 1px solid var(--frost-blue); border-radius: 16px; padding: 20px 22px; }
  .stat-label { font-size: 11px; font-weight: 700; color: var(--muted-slate); text-transform: uppercase; letter-spacing: 0.08em; }
  .stat-value { font-weight: 800; font-size: 30px; color: var(--slate); letter-spacing: -0.025em; margin-top: 6px; }
  .stat-empty { color: var(--frost-blue); }
  .stat-sub { font-size: 12px; color: var(--muted-slate); margin-top: 2px; }

  .connect-card {
    background: var(--white); border: 1px solid var(--frost-blue); border-radius: 16px;
    padding: 20px 22px; display: flex; align-items: center; gap: 18px;
    transition: border-color 0.15s ease;
  }
  .connect-card:hover { border-color: rgba(0,196,180,0.4); }
  .connect-card-icon { color: var(--muted-slate); flex-shrink: 0; }
  .connect-card-body { flex: 1; min-width: 0; }
  .connect-card-title { font-weight: 700; font-size: 15px; color: var(--slate); margin-bottom: 3px; }
  .connect-card-desc { font-size: 13px; color: var(--muted-slate); line-height: 1.5; }

  .coming-soon-card {
    background: var(--white); border: 1.5px dashed var(--frost-blue); border-radius: 20px;
    padding: 40px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px;
  }
  .coming-soon-label {
    font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
    color: var(--muted-slate); background: var(--frost); border: 1px solid var(--frost-blue);
    padding: 3px 10px; border-radius: 999px;
  }
  .coming-soon-title { font-weight: 800; font-size: 20px; color: var(--slate); letter-spacing: -0.02em; margin-top: 4px; }
  .coming-soon-desc { font-size: 14px; color: var(--muted-slate); line-height: 1.6; max-width: 400px; }

  .tool-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .tool-card {
    background: var(--white); border: 1px solid var(--frost-blue); border-radius: 16px;
    padding: 20px; text-decoration: none; display: flex; flex-direction: column; gap: 8px;
    transition: border-color 0.15s ease, box-shadow 0.15s ease; cursor: pointer;
  }
  .tool-card:hover { border-color: var(--teal); box-shadow: 0 4px 16px -8px rgba(0,196,180,0.2); }
  .tool-card-featured { border-color: rgba(0,196,180,0.35); background: rgba(0,196,180,0.02); }
  .tool-card-top { display: flex; align-items: center; justify-content: space-between; }
  .tool-card-icon { font-size: 22px; line-height: 1; }
  .tool-card-tag {
    font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em;
    color: var(--muted-slate); background: var(--frost); border: 1px solid var(--frost-blue);
    padding: 2px 8px; border-radius: 999px;
  }
  .tool-card-tag-teal { color: var(--teal); background: rgba(0,196,180,0.08); border-color: rgba(0,196,180,0.3); }
  .tool-card-name { font-weight: 700; font-size: 15px; color: var(--slate); }
  .tool-card-desc { font-size: 13px; color: var(--muted-slate); line-height: 1.5; }

  .featured-tool-card {
    background: var(--white); border: 1.5px solid rgba(0,196,180,0.35); border-radius: 18px;
    padding: 24px 28px; text-decoration: none; display: block;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .featured-tool-card:hover { border-color: var(--teal); box-shadow: 0 8px 24px -12px rgba(0,196,180,0.25); }

  .tactic-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .tactic-card { background: var(--white); border: 1px solid var(--frost-blue); border-radius: 16px; padding: 22px; display: flex; flex-direction: column; gap: 8px; }
  .tactic-icon { font-size: 22px; line-height: 1; }
  .tactic-title { font-weight: 700; font-size: 15px; color: var(--slate); }
  .tactic-desc { font-size: 13px; color: var(--muted-slate); line-height: 1.6; }

  .posting-grid { display: grid; grid-template-columns: 60px repeat(4, 1fr); gap: 6px; }
  .posting-grid-header { font-size: 11px; font-weight: 700; color: var(--muted-slate); text-align: center; padding: 6px 0; text-transform: uppercase; letter-spacing: 0.07em; }
  .posting-grid-day { font-size: 12px; font-weight: 700; color: var(--muted-slate); display: flex; align-items: center; }
  .posting-grid-cell { border-radius: 8px; padding: 8px 4px; text-align: center; font-size: 10px; font-weight: 700; letter-spacing: 0.04em; transition: transform 0.1s ease; }

  .age-bars { display: flex; flex-direction: column; gap: 10px; }
  .age-bar-row { display: flex; align-items: center; gap: 12px; }
  .age-bar-label { font-size: 13px; font-weight: 600; color: var(--muted-slate); width: 44px; flex-shrink: 0; }
  .age-bar-track { flex: 1; height: 10px; background: var(--frost); border-radius: 999px; overflow: hidden; }
  .age-bar-fill { height: 100%; background: var(--teal); border-radius: 999px; transition: width 0.6s ease; }
  .age-bar-pct { font-size: 13px; font-weight: 700; color: var(--slate); width: 36px; text-align: right; flex-shrink: 0; }

  /* Generate image modal */
  .gen-overlay {
    position: fixed; inset: 0; z-index: 600;
    background: rgba(28,43,74,0.3); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; padding: 24px;
  }
  .gen-modal {
    background: var(--white); border-radius: 20px; padding: 28px;
    width: 100%; max-width: 480px; box-shadow: 0 32px 80px -20px rgba(28,43,74,0.28);
    display: flex; flex-direction: column; gap: 16px;
  }
  .gen-modal-title { font-weight: 800; font-size: 19px; letter-spacing: -0.02em; color: var(--slate); }
  .gen-modal-sub { font-size: 13px; color: var(--muted-slate); margin-top: -8px; line-height: 1.5; }
  .gen-modal-input {
    width: 100%; padding: 12px 16px; border-radius: 12px;
    background: var(--frost); border: 1.5px solid var(--frost-blue);
    font-family: 'Outfit', sans-serif; font-size: 14px; color: var(--slate); outline: none; resize: none;
    transition: border-color 0.2s ease; min-height: 80px; line-height: 1.5;
  }
  .gen-modal-input:focus { border-color: #8B5CF6; }
  .gen-modal-input::placeholder { color: var(--muted-slate); }
  .gen-modal-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .gen-modal-limit { font-size: 12px; color: var(--muted-slate); }
  .gen-modal-actions { display: flex; gap: 8px; }
  .gen-cancel-btn {
    font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 14px;
    color: var(--muted-slate); background: var(--frost); border: 1.5px solid var(--frost-blue);
    border-radius: 10px; padding: 10px 16px; cursor: pointer; transition: background 0.15s ease;
  }
  .gen-cancel-btn:hover { background: var(--frost-blue); }
  .gen-submit-btn {
    font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 14px;
    color: var(--white); background: #8B5CF6; border: none; border-radius: 10px;
    padding: 10px 20px; cursor: pointer; transition: background 0.15s ease; display: flex; align-items: center; gap: 6px;
  }
  .gen-submit-btn:hover { background: #7C3AED; }
  .gen-submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .gen-btn {
    width: 44px; height: 44px; border-radius: 12px; background: var(--frost);
    border: 1.5px solid var(--frost-blue); cursor: pointer;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    color: var(--muted-slate); transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease;
  }
  .gen-btn:hover { border-color: #8B5CF6; color: #8B5CF6; background: rgba(139,92,246,0.06); }
  .gen-btn svg { width: 18px; height: 18px; }

  .ask-sarti-btn {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 12px;
    color: var(--muted-slate); background: var(--frost);
    border: 1px solid var(--frost-blue); border-radius: 999px;
    padding: 5px 12px; cursor: pointer; margin-top: 10px; width: fit-content;
    transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
  }
  .ask-sarti-btn:hover { color: var(--teal); border-color: rgba(0,196,180,0.4); background: rgba(0,196,180,0.06); }

  @media (max-width: 900px) {
    .stat-grid { grid-template-columns: repeat(2, 1fr); }
    .tool-grid { grid-template-columns: repeat(2, 1fr); }
    .tactic-grid { grid-template-columns: 1fr; }
    .panel-view { padding: 24px 20px; }
  }
`

const AVATAR = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="36" width="15" height="30" rx="7.5" fill="#1C2B4A"/>
  <rect x="82" y="36" width="15" height="30" rx="7.5" fill="#1C2B4A"/>
  <circle cx="50" cy="51" r="39" fill="#00C4B4"/>
  <rect x="20" y="27" width="60" height="47" rx="22" fill="#11A496"/>
  <path d="M29 54 L37.5 45 L46 54" fill="none" stroke="#1C2B4A" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M54 54 L62.5 45 L71 54" fill="none" stroke="#1C2B4A" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

interface Message {
  role: 'user' | 'assistant'
  content: string
  imagePreview?: string
}
interface Brand {
  id: string
  title?: string | null
  stage: string; description: string
  audience_report: Record<string, unknown> | null
  roadmap: Array<{phase: string; timeframe: string; steps: string[]; tools: string[]}> | null
  marketing_plan: Record<string, unknown> | null
  plan?: string | null
}
interface User { id: string; email: string; name: string }

function formatMessage(text: string) {
  return text.split('\n\n').map(para => {
    const html = para
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/(https?:\/\/[^\s<]+)/g, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`)
      .replace(/\n/g, '<br/>')
    return `<p>${html}</p>`
  }).join('')
}

function splitMessageSegments(text: string): string[] {
  const lines = text.split('\n')
  const segments: string[] = []
  let current: string[] = []

  for (const line of lines) {
    if (/^\d+\.\s/.test(line.trim())) {
      if (current.length > 0) {
        const joined = current.join('\n').trim()
        if (joined) segments.push(joined)
        current = []
      }
      segments.push(line.trim())
    } else {
      current.push(line)
    }
  }
  if (current.length > 0) {
    const joined = current.join('\n').trim()
    if (joined) segments.push(joined)
  }

  return segments.length > 1 ? segments : [text]
}

export default function AppShell({ user, brand, brands, initialMessages, view: initialView = 'chat' }: { user: User; brand: Brand; brands: Brand[]; initialMessages: Message[]; view?: string }) {
  const router = useRouter()
  const [currentView, setCurrentView] = useState(initialView)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [atLimit, setAtLimit] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [dailyLimit, setDailyLimit] = useState<number>(5)

  // Image upload (Partner only)
  const [pendingImage, setPendingImage] = useState<string | null>(null)
  const [pendingImageType, setPendingImageType] = useState<string>('image/jpeg')
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Plan modal
  const [plan, setPlan] = useState<string>(brand.plan ?? 'student')
  const [planOpen, setPlanOpen] = useState(false)
  const [pendingPlan, setPendingPlan] = useState<string>(brand.plan ?? 'student')
  const [savingPlan, setSavingPlan] = useState(false)

  // Image generation (Label only)
  const [showGenModal, setShowGenModal] = useState(false)
  const [genPrompt, setGenPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genRemaining, setGenRemaining] = useState<number>(5)

  // Question flow
  const [qActive, setQActive] = useState(false)
  const [qIndex, setQIndex] = useState(0)
  const [qAnswers, setQAnswers] = useState<string[]>([])
  const [showOtherInput, setShowOtherInput] = useState(false)
  const [otherInput, setOtherInput] = useState('')
  const [multiSelected, setMultiSelected] = useState<string[]>([])

  const threadRef = useRef<HTMLDivElement>(null)
  const userInitial = (user.name || user.email || 'U')[0].toUpperCase()
  const isPartner = plan === 'partner' || plan === 'label'
  const isLabel = plan === 'label'

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight
  }, [messages, loading])

  // Fetch daily status on mount and on plan change
  useEffect(() => {
    fetch(`/api/chat/status?brandId=${brand.id}`)
      .then(r => r.json())
      .then(data => {
        setRemaining(data.remaining ?? 0)
        setDailyLimit(data.limit ?? 5)
        setAtLimit((data.remaining ?? 0) <= 0)
      })
      .catch(() => {})
  }, [plan])

  function getQuestionText(q: Question, answers: string[]): string {
    return typeof q.q === 'function' ? q.q(answers) : q.q
  }

  // Start question flow if chat is empty
  useEffect(() => {
    if (initialMessages.length > 0) return
    setMessages([
      { role: 'assistant', content: "Okay — before we get into it, let me ask a few quick questions so I can build your plan around you specifically." },
      { role: 'assistant', content: getQuestionText(QUESTIONS[0], []) },
    ])
    setQActive(true)
    setQIndex(0)
  }, [])

  async function handleQuestionAnswer(answer: string) {
    const newAnswers = [...qAnswers, answer]
    setQAnswers(newAnswers)
    setShowOtherInput(false)
    setOtherInput('')
    setMessages(prev => [...prev, { role: 'user', content: answer }])

    const nextIndex = qIndex + 1
    if (nextIndex < QUESTIONS.length) {
      setQIndex(nextIndex)
      setMessages(prev => [...prev, { role: 'assistant', content: getQuestionText(QUESTIONS[nextIndex], newAnswers) }])
    } else {
      // All answered — get first step
      setQActive(false)
      setLoading(true)
      setMessages(prev => [...prev, { role: 'assistant', content: "Got it — give me a second." }])
      try {
        const res = await fetch('/api/chat/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brandId: brand.id, answers: newAnswers }),
        })
        const data = await res.json()
        if (data.message) {
          setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = { role: 'assistant', content: data.message }
            return updated
          })
        }
      } catch {
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: "Something went wrong — refresh and try again." }
          return updated
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const openPlanModal = () => { setPendingPlan(plan); setPlanOpen(true) }

  async function savePlan() {
    if (pendingPlan === plan) { setPlanOpen(false); return }
    setSavingPlan(true)
    try {
      const supabase = createClient()
      await supabase.from('brands').update({ plan: pendingPlan }).eq('user_id', user.id)
      setPlan(pendingPlan)
      setAtLimit(false)
    } catch { /* silent */ } finally {
      setSavingPlan(false)
      setPlanOpen(false)
    }
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      const base64 = result.split(',')[1]
      setPendingImage(base64)
      setPendingImageType(file.type)
      setPendingImagePreview(result)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function sendMessage() {
    const text = input.trim()
    if ((!text && !pendingImage) || loading || atLimit) return

    const imagePreview = pendingImagePreview ?? undefined
    setMessages(prev => [...prev, { role: 'user', content: text || '(image sent)', imagePreview }])
    const imgData = pendingImage
    const imgType = pendingImageType
    setInput('')
    setPendingImage(null)
    setPendingImageType('image/jpeg')
    setPendingImagePreview(null)
    setLoading(true)

    try {
      const history = messages.slice(-12).map(m => ({ role: m.role, content: m.content }))
      const body: Record<string, unknown> = { message: text || '(image sent)', history, brandId: brand.id }
      if (imgData) { body.imageData = imgData; body.imageMimeType = imgType }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.status === 429) {
        const data = await res.json()
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
        setAtLimit(true)
        setRemaining(0)
      } else if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
        if (typeof data.remaining === 'number') {
          setRemaining(data.remaining)
          if (data.remaining <= 0) setAtLimit(true)
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Something went wrong. Try again." }])
    } finally {
      setLoading(false)
    }
  }

  async function generateImage() {
    const p = genPrompt.trim()
    if (!p || generating) return
    setGenerating(true)
    setShowGenModal(false)
    setMessages(prev => [...prev, { role: 'user', content: `Generate: ${p}` }])
    setMessages(prev => [...prev, { role: 'assistant', content: '⏳ Generating your image...' }])
    setGenPrompt('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: p, brandId: brand.id }),
      })
      const data = await res.json()
      if (data.imageUrl) {
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: `Here's what I generated for you:`, imagePreview: data.imageUrl }
          return updated
        })
        if (typeof data.remaining === 'number') setGenRemaining(data.remaining)
      } else {
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: data.error ?? 'Something went wrong generating the image.' }
          return updated
        })
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: 'Something went wrong. Try again.' }
        return updated
      })
    } finally {
      setGenerating(false)
    }
  }

  function askSarti(prompt: string) {
    setCurrentView('chat')
    setInput(prompt)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const currentPlanMeta = PLANS.find(p => p.id === plan) ?? PLANS[0]

  const counterClass = remaining === null ? '' : remaining === 0 ? 'zero' : remaining <= 2 ? 'low' : ''

  return (
    <>
      <style>{pageStyles}</style>
      <div className="app-layout">
        <aside className="app-sidebar">
          <a href="/" className="app-wordmark">sartile<span>.com</span></a>
          <nav className="sidebar-nav">
            <button className={`sidebar-link ${currentView === 'chat' ? 'active' : ''}`} onClick={() => setCurrentView('chat')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
              Chat with sarti
            </button>

            <div className="sidebar-section-label" style={{marginTop: 8}}>Dashboard</div>

            <button className={`sidebar-link ${currentView === 'analytics' ? 'active' : ''}`} onClick={() => setCurrentView('analytics')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              Analytics
            </button>

            <button className={`sidebar-link ${currentView === 'audience' ? 'active' : ''}`} onClick={() => setCurrentView('audience')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
              Audience
            </button>

            <button className={`sidebar-link ${currentView === 'designs' ? 'active' : ''}`} onClick={() => setCurrentView('designs')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                <path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>
              </svg>
              Designs
            </button>

            <button className={`sidebar-link ${currentView === 'marketing' ? 'active' : ''}`} onClick={() => setCurrentView('marketing')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
              Marketing
            </button>

            {brands.length > 0 && (
              <>
                <div className="sidebar-section-label" style={{marginTop: 8}}>Roadmaps</div>
                {brands.map(b => (
                  <button
                    key={b.id}
                    className={`sidebar-brand ${b.id === brand.id ? 'active' : ''}`}
                    onClick={() => router.push(`/app?brand=${b.id}`)}
                    title={b.title ?? b.description?.slice(0, 60)}
                  >
                    <span className="sidebar-brand-dot" />
                    {b.title ?? 'My Brand'}
                  </button>
                ))}
              </>
            )}

            <a href="/onboarding" className="sidebar-link" style={{marginTop: '4px'}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Roadmap
            </a>
          </nav>
          <div className="sidebar-bottom">
            <div className="user-chip" onClick={openPlanModal} title="Change plan">
              <div className="user-avatar">{userInitial}</div>
              <div className="user-info">
                <div className="user-name">{user.name || user.email}</div>
                <span className={`plan-badge ${plan}`}>{currentPlanMeta.label}</span>
              </div>
              <svg className="chip-edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <button className="sidebar-link" onClick={signOut}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign out
            </button>
          </div>
        </aside>

        <main className="app-main">
          <div className="mobile-header">
            <a href="/" style={{fontWeight:700,fontSize:20,letterSpacing:'-0.025em',color:'var(--slate)',textDecoration:'none'}}>
              sartile<span style={{color:'var(--teal)'}}>.com</span>
            </a>
            <a href="/onboarding" style={{padding:'8px 14px',borderRadius:'999px',border:'1.5px solid var(--frost-blue)',background:'transparent',fontFamily:'Outfit,sans-serif',fontSize:'13px',fontWeight:600,color:'var(--muted-slate)',textDecoration:'none'}}>+ Roadmap</a>
          </div>

          {currentView === 'analytics' && <AnalyticsPanel brand={brand} onAskSarti={askSarti} />}
          {currentView === 'audience' && <AudiencePanel brand={brand} onAskSarti={askSarti} />}
          {currentView === 'designs' && <DesignsPanel brand={brand} onAskSarti={askSarti} />}
          {currentView === 'marketing' && <MarketingPanel brand={brand} onAskSarti={askSarti} />}

          <div className="chat-view" style={currentView !== 'chat' ? { display: 'none' } : {}}>
            <div className="chat-header">
              <div className="chat-header-left">
                <div className="chat-status-dot" />
                <span className="chat-header-name">sarti</span>
                <span className="chat-header-sub">— {brand.title ?? 'your brand'}</span>
              </div>
              <div className={`msg-counter ${counterClass}`}>
                {remaining === null
                  ? '...'
                  : `${remaining} of ${dailyLimit} left today`
                }
              </div>
            </div>

            <div className="chat-thread" ref={threadRef}>
              {messages.flatMap((msg, i) => {
                if (msg.role === 'user') {
                  return [(
                    <div key={i} className="msg-row user">
                      <div className="msg-bubble user">
                        {msg.imagePreview && <img src={msg.imagePreview} alt="" className="msg-img-preview" />}
                        <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                      </div>
                    </div>
                  )]
                }
                const segments = splitMessageSegments(msg.content)
                return segments.map((seg, si) => (
                  <div key={`${i}-${si}`} className="msg-row">
                    <div
                      className="msg-avatar"
                      style={si > 0 ? { visibility: 'hidden' } : {}}
                      dangerouslySetInnerHTML={{ __html: AVATAR }}
                    />
                    <div className="msg-bubble">
                      <div dangerouslySetInnerHTML={{ __html: formatMessage(seg) }} />
                    </div>
                  </div>
                ))
              })}
              {loading && (
                <div className="typing-row">
                  <div className="msg-avatar" dangerouslySetInnerHTML={{ __html: AVATAR }} />
                  <div className="typing-dots">
                    <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                  </div>
                </div>
              )}
            </div>

            {atLimit && !qActive && (
              <div className="limit-banner">
                You've used all your messages for today.{' '}
                {plan === 'student' && <><a onClick={openPlanModal}>Upgrade to Founder</a> for 15/day.</>}
                {plan === 'founder' && <><a onClick={openPlanModal}>Upgrade to Partner</a> for 50/day.</>}
                {plan === 'partner' && <><a onClick={openPlanModal}>Upgrade to Label</a> for 150/day.</>}
                {(plan === 'label' || plan === 'absent') && 'Come back tomorrow.'}
              </div>
            )}

            {qActive && (
              <div className="question-chips">
                {QUESTIONS[qIndex].options.filter(o => o !== 'Other').map(opt => {
                  const isMulti = QUESTIONS[qIndex].multiSelect
                  const isSelected = multiSelected.includes(opt)
                  return (
                    <button
                      key={opt}
                      className={`question-chip${isSelected ? ' selected' : ''}`}
                      onClick={() => {
                        if (isMulti) {
                          setMultiSelected(prev => prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt])
                        } else {
                          handleQuestionAnswer(opt)
                        }
                      }}
                    >
                      {opt}
                    </button>
                  )
                })}
                {QUESTIONS[qIndex].options.includes('Other') && (
                  <button
                    className={`question-chip question-chip-other${showOtherInput ? ' selected' : ''}`}
                    onClick={() => { setShowOtherInput(o => !o); setOtherInput('') }}
                  >
                    Other
                  </button>
                )}
                {QUESTIONS[qIndex].helpBtn && (
                  <button className="question-chip question-chip-help" onClick={() => handleQuestionAnswer("I'm not sure yet — help me figure it out")}>
                    {QUESTIONS[qIndex].helpBtn}
                  </button>
                )}
                {showOtherInput && (
                  <div className="other-input-row">
                    <input
                      className="other-input"
                      type="text"
                      autoFocus
                      placeholder="Type your answer..."
                      value={otherInput}
                      onChange={e => setOtherInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && otherInput.trim()) handleQuestionAnswer(otherInput.trim()) }}
                    />
                    <button
                      className="other-input-submit"
                      disabled={!otherInput.trim()}
                      onClick={() => { if (otherInput.trim()) handleQuestionAnswer(otherInput.trim()) }}
                    >
                      →
                    </button>
                  </div>
                )}
                {QUESTIONS[qIndex].multiSelect && !showOtherInput && (
                  <button
                    className="question-chip-done"
                    disabled={multiSelected.length === 0}
                    onClick={() => { handleQuestionAnswer(multiSelected.join(', ')); setMultiSelected([]) }}
                  >
                    Done →
                  </button>
                )}
              </div>
            )}

            <div className="chat-input-area" style={qActive ? { display: 'none' } : {}}>
              {pendingImagePreview && (
                <div className="image-preview-strip">
                  <img src={pendingImagePreview} alt="" className="image-preview-thumb" />
                  <button className="image-preview-remove" onClick={() => { setPendingImage(null); setPendingImagePreview(null) }}>×</button>
                  <span style={{fontSize:'12px',color:'var(--muted-slate)'}}>Image attached</span>
                </div>
              )}
              <div className="chat-input-wrap">
                {isPartner && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageSelect}
                    />
                    <button className="img-btn" onClick={() => fileInputRef.current?.click()} title="Attach image">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="3"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </button>
                  </>
                )}
                {isLabel && (
                  <button className="gen-btn" onClick={() => setShowGenModal(true)} title={`Generate image (${genRemaining} left today)`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </button>
                )}
                <textarea
                  ref={textareaRef}
                  className="chat-textarea"
                  placeholder={atLimit ? "No messages left today..." : "Tell sarti what you've done, or ask anything..."}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }}}
                  rows={1}
                  disabled={atLimit}
                />
                <button
                  className="send-btn"
                  onClick={sendMessage}
                  disabled={(!input.trim() && !pendingImage) || loading || atLimit}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {planOpen && (
        <div className="plan-overlay" onClick={e => { if (e.target === e.currentTarget) setPlanOpen(false) }}>
          <div className="plan-modal">
            <div className="plan-modal-header">
              <div>
                <div className="plan-modal-title">Change plan</div>
                <div className="plan-modal-sub">Switch your tier. Changes take effect immediately.</div>
              </div>
              <button className="plan-modal-close" onClick={() => setPlanOpen(false)}>×</button>
            </div>
            <div className="plan-cards">
              {PLANS.map(p => (
                <div key={p.id} className={`plan-card ${pendingPlan === p.id ? 'active' : ''}`} onClick={() => setPendingPlan(p.id)}>
                  <div className="plan-card-dot" />
                  <div className="plan-card-info">
                    <div className="plan-card-name">{p.label}</div>
                    <div className="plan-card-questions">{p.questions}</div>
                  </div>
                  <div className="plan-card-price">{p.price}</div>
                </div>
              ))}
            </div>
            <button className="plan-save-btn" onClick={savePlan} disabled={savingPlan}>
              {savingPlan ? 'Saving...' : 'Save plan'}
            </button>
            <div className="plan-admin-note">Admin override — no payment required</div>
          </div>
        </div>
      )}

      {showGenModal && (
        <div className="gen-overlay" onClick={e => { if (e.target === e.currentTarget) setShowGenModal(false) }}>
          <div className="gen-modal">
            <div className="gen-modal-title">Generate an image</div>
            <div className="gen-modal-sub">Describe what you want — a product concept, design idea, mockup style, or any visual you're imagining for your brand.</div>
            <textarea
              className="gen-modal-input"
              autoFocus
              placeholder="e.g. oversized black hoodie with minimalist white embroidery, flat lay on marble surface..."
              value={genPrompt}
              onChange={e => setGenPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generateImage() }}}
            />
            <div className="gen-modal-footer">
              <div className="gen-modal-limit">{genRemaining} generation{genRemaining !== 1 ? 's' : ''} left today</div>
              <div className="gen-modal-actions">
                <button className="gen-cancel-btn" onClick={() => setShowGenModal(false)}>Cancel</button>
                <button className="gen-submit-btn" disabled={!genPrompt.trim() || generating} onClick={generateImage}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
