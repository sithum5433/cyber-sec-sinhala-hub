# 🛡️ CYBER-SEC SINHALA & ENGLISH HUB
### TryHackMe Pentesting Knowledge Base & Interactive Learning Portal
**Created by:** L.G Sithum Sanjana (Sithum404 / NoScope)  
**Certification:** TryHackMe Web Application Pentesting (36h 53m)

---

## 🚀 Overview

This website is a comprehensive, production-grade cybersecurity and penetration testing knowledge portal compiled from over **64 TryHackMe modules and walkthroughs**. 

All original AI prompts (such as *"think you are my personal teacher and tech me in sinhala..."*) and Gemini web interface clutter have been completely removed. What remains is a pure, structured, bilingual educational masterclass featuring:
- **Sinhala Detailed Explanations (සිංහල සම්පූර්ණ විස්තරය)**: Crystal-clear analogies, step-by-step logic, and technical breakdowns in Sinhala.
- **English Master Theory & Cheat Sheets (ඉංග්‍රීසි කෙටි සටහන් සහ න්‍යාය)**: Concise definitions, command syntaxes, protocol workflows, and technical summaries.
- **Practicals, Commands & Payloads**: Formatted code blocks with **1-click Copy** for terminal commands, Python scripts, Burp Suite HTTP requests, and exploit payloads.
- **Blue Team Hardening & Detection ("Filled Gaps")**: Every module is enriched with MITRE ATT&CK techniques, CWE IDs, Windows Event IDs/auditd detection rules, remediation checklists, and interactive challenge Q&A.

---

## 🌐 Quick Launch

To run the portal locally on your machine, simply run:

```bash
python3 -m http.server 8000
```

Then open your browser at:
👉 **[http://localhost:8000](http://localhost:8000)**

Use the HTTP server rather than opening `index.html` with a `file://` URL, because
the portal loads its JSON knowledge base with `fetch()`. You can choose a port:

```bash
./start_server.sh 8080
```

---

## 📚 10 Knowledge Tracks & Categories

1. 🛡️ **Active Directory & Windows Pentesting** (AD Auth, Kerberos, AS-REP Roasting, Lateral Movement, BloodHound, Credential Stores, Windows PrivEsc)
2. 🌐 **Web Application Security - OWASP Top 10** (SQLi, Advanced Blind SQLi, NoSQLi, LDAPi, XXE, XSS, CSRF, SSRF, SSTI, Insecure Deserialization, Race Conditions, Broken Auth, Session Management)
3. ⚡ **HTTP Protocols & Smuggling Techniques** (HTTP/1.1 Pipelining, Request Smuggling CL.TE / TE.CL, HTTP/2 Smuggling, WebSocket Desync, SOP)
4. 🔑 **API & Token Security** (JWT Pentesting, alg:none, Key Confusion, OAuth 2.0 Account Takeover)
5. 💻 **Secure Source Code Auditing** (PHP Sinks & Type Juggling, Flask SSTI & Werkzeug PIN Exploit, JavaScript Prototype Pollution)
6. 🐧 **Linux Privilege Escalation** (Sudo Abuse, GTFOBins, LinPEAS, SUID Binaries, Capabilities, Cron Jobs)
7. 🎯 **Reconnaissance, Shells & Metasploit** (Burp Suite Masterclass, Pentesting Methodology, Wordlists & Fuzzing, Shell Payloads & TTY Upgrades, Metasploit, Meterpreter, Msfvenom, Vulnerability Databases, Wi-Fi 802.11)
8. 🏢 **Defensive Security, SOC & Cloud** (Inside SOC, Threat Modeling STRIDE/PASTA, Cloud Security AWS/Azure/GCP, DevSecOps CI/CD Pipelines, Re-Testing)
9. 🤖 **Red Teaming, LLM & Mobile Security** (Red Team Fundamentals & C2, LLM Prompt Injection & Jailbreaking, Android APK Reverse Engineering)
10. 🏆 **Machine Walkthroughs, Exploits & Reports** (TryHackMe Machines, lab exploit examples, and a sanitized public assessment demo)

---

## ✨ Features & Architecture

### ✦ Curated 2026 learning tracks

The portal now loads an additional reviewed study set from
[`data/next_topics.json`](./data/next_topics.json). It covers API authorization/BOLA,
cloud IAM and metadata security, Windows DFIR initial triage, Kerberoasting defense,
and responsible bug-bounty reconnaissance. These modules include an accuracy note,
authorized-lab boundaries, practical commands, questions, remediation, and detection
guidance. Content is an educational reference: always verify provider versions,
program scope, and lab targets before running a command.

The refreshed interface also includes:

- Responsive command-center layout with mobile navigation.
- `Ctrl+K` or `/` search focus shortcuts.
- Full-text search through task explanations and code-related metadata.
- Curated-topic badges and dynamic module/task counters.
- Accessibility skip navigation and keyboard-focus states.

The curated study set also includes a practical bug-bounty workflow (scope,
passive discovery, low-rate validation, reporting, and authorized automation)
and a Rust security-engineering track covering Cargo, dependency auditing,
defensive HTTP header checks, streaming log analysis, and constrained lab
inventory utilities. Commands are intentionally bounded to approved targets;
replace placeholders only inside a lab or a program that explicitly authorizes
the activity.

- **🌐 Tri-Mode Language Switcher**:
  - **Dual View (දෙබසම)**: Side-by-side comparative layout with Sinhala on the left and English on the right.
  - **Sinhala Only (සිංහල)**: Deep-dive conceptual focus.
  - **English Only (English)**: Direct technical breakdown and cheat sheets.
- **⚡ Interactive Cheat Sheet Hub**:
  - Instant 1-click copyable payloads for Reverse Shells (Bash, Python, Netcat, Socat, PowerShell), Active Directory (Impacket, BloodHound, secretsdump), Linux PrivEsc (Sudo GTFOBins), and Web Payloads (SQLi, XSS, SSTI, XXE).
- **🏆 TryHackMe Machines Lab**:
  - Detailed, phase-by-phase exploitation walkthroughs for:
    - **Orion** (CraftCMS CVE-2025-32432, Telnetd CVE-2026-24061 Root)
    - **Abducted** (Samba Spooler CVE-2026-4480, rclone decrypt, polkit drop-in root)
    - **Nexus** (Gitea leak, Krayin CRM CVE-2026-38526, template directory traversal root)
    - **What's Your Name** (XSS to CSRF chaining, directory fuzzing)
- **📑 Public Security Assessment Demonstration**:
  - Interactive viewer for a sanitized fictional assessment demo, featuring Executive Summary, CVSS risk ratings, and Remediation guidelines.
- **🐍 MFA Exploit Studio (`mfaexploit.py`)**:
  - Interactive code viewer and breakdown of the OTP race condition and brute force script against `mfa.thm/labs/third/`.
- **🔍 Instant Fuzzy Search**:
  - Live search across all 59 modules in both Sinhala and English, filtering by keywords, tags, CVEs, or tool names.
- **🔖 LocalStorage Persistence**:
  - Bookmark topics and track completion progress directly in your browser.
