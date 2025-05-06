document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements from index.html ---
    const sceneDisplayEl = document.getElementById('scene-display');
    const optionsDisplayEl = document.getElementById('options-display');
    const popupDisplayEl = document.getElementById('popup-display');
    const gameOverDisplayEl = document.getElementById('game-over-display');
    const roleSelectionAreaEl = document.getElementById('role-selection-area');
    const roleConfirmationEl = document.getElementById('role-confirmation');
    const mainGameAreaEl = document.getElementById('main-game-area');
    const metricMoneyEl = document.getElementById('metric-money');
    const metricPublicSupportEl = document.getElementById('metric-public-support');
    const metricEthicalDecisionsEl = document.getElementById('metric-ethical-decisions');

    // --- Game State ---
    const roles = {
        A: "Investor", B: "Regulator", C: "Scientist", D: "Citizen"
    };
    const roleDescriptions = {
        A: "Steer the money, drive innovation, and chase returns. Your capital shapes the future, but at what cost to equity or safety?",
        B: "Guard the gates, establish ethical boundaries, and protect public interest. Your caution may slow progress but prevent catastrophe.",
        C: "Wield the tools, push the boundaries of knowledge, and unlock new possibilities. Your discoveries can be revolutionary or reckless.",
        D: "Contest the meaning, advocate for justice, and give voice to the voiceless. Your activism can shift paradigms or be dismissed by power."
    };
    let currentRole = null;
    let M = { money: 100, publicSupport: 0, ethicalDecisions: 0 };

    const roleInitialEffects = {
        A: { text: "Access to $100M investment capital. Market Focus: -1 Public Support, -1 Ethical Decisions (prioritizes profit over broader moral considerations).", effects: { publicSupport: -1, ethicalDecisions: -1 } },
        B: { text: "Operational Budget: -$5M. Public Mandate: +2 Public Support, +1 Ethical Decisions (strong moral framework).", effects: { money: -5, publicSupport: +2, ethicalDecisions: +1 } },
        C: { text: "Lab Setup: -$5M. Research Grant: +1 Ethical Decisions (commitment to responsible innovation).", effects: { money: -5, ethicalDecisions: +1, publicSupport: 0 } },
        D: { text: "Grassroots Fund: -$5M. Community Mobilization: +2 Public Support, +1 Ethical Decisions (advocacy for justice).", effects: { money: -5, publicSupport: +2, ethicalDecisions: +1 } }
    };

    // --- Core Functions ---
    function updateMetricsDisplay() {
        metricMoneyEl.textContent = M.money;
        metricPublicSupportEl.textContent = M.publicSupport;
        metricEthicalDecisionsEl.textContent = M.ethicalDecisions;

        if (gameOverDisplayEl.style.display === 'none') {
            if (M.money < 0) {
                triggerGameOver("You've gone bankrupt! Your influence collapses under financial ruin.");
            } else if (M.publicSupport < -3) {
                triggerGameOver("Public trust has collapsed! Your position is untenable due to widespread opposition and protest.");
            } else if (M.ethicalDecisions < -3) {
                triggerGameOver("A major ethical crisis has occurred! Your decisions have led to severe moral failings and widespread condemnation.");
            }
        }
    }

    function clearUI(clearPopup = true) {
        optionsDisplayEl.innerHTML = '';
        if (clearPopup) {
            popupDisplayEl.innerHTML = '';
            popupDisplayEl.style.display = 'none';
        }
    }

    function setScene(htmlContent) {
        sceneDisplayEl.innerHTML = htmlContent;
    }

    function showPopup(htmlMessage) {
        popupDisplayEl.innerHTML = htmlMessage;
        popupDisplayEl.style.display = 'block';
    }
    
    function triggerGameOver(message) {
        clearUI(false); 
        setScene("<h3>GAME OVER</h3>"); 
        
        gameOverDisplayEl.innerHTML = `<strong>${message}</strong>`;
        gameOverDisplayEl.style.display = 'block';
        gameOverDisplayEl.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        gameOverDisplayEl.style.padding = '20px';
        gameOverDisplayEl.style.border = '1px solid red';
        
        popupDisplayEl.style.display = 'none'; 

        mainGameAreaEl.style.filter = 'none';
        optionsDisplayEl.innerHTML = `<button onclick="window.globalGameFunctions.chooseRole()">Play Again?</button>`;
    }

    function addBtn(labelHtml, delta, next) {
        const btn = document.createElement('button');
        btn.innerHTML = labelHtml;
        btn.onclick = () => {
            if (gameOverDisplayEl.style.display === 'block') return; 

            let effectText = "Your choice resulted in: ";
            let changes = [];
            for (const k in delta) {
                if (M.hasOwnProperty(k)) {
                    M[k] += delta[k];
                    const metricName = k === 'money' ? 'Money' : (k === 'publicSupport' ? 'Public Support' : 'Ethical Decisions');
                    changes.push(`<strong>${metricName}</strong> ${delta[k] >= 0 ? '+' : ''}${delta[k]}`);
                }
            }
            effectText += changes.join(', ') || "no immediate metric changes.";
            
            updateMetricsDisplay(); 
            
            if (gameOverDisplayEl.style.display === 'block') {
                 showPopup(effectText + "<br/>" + gameOverDisplayEl.innerHTML); 
                 return;
            }

            const popupContent = `${effectText}<br/><button onclick="window.globalGameFunctions.clearPopupAndProceed(window.globalGameFunctions.nextStep)">I Understand</button>`;
            showPopup(popupContent);
            
            window.globalGameFunctions.nextStep = next;
        };
        optionsDisplayEl.appendChild(btn);
    }

    // Initialize the global namespace for game functions FIRST
    window.globalGameFunctions = window.globalGameFunctions || {};

    // New helper function
    window.globalGameFunctions.clearPopupAndProceed = function(nextFunc) {
        popupDisplayEl.innerHTML = '';
        popupDisplayEl.style.display = 'none';
        if (gameOverDisplayEl.style.display !== 'block' && typeof nextFunc === 'function') {
            nextFunc();
        }
    }
    
    window.globalGameFunctions.chooseRole = function() {
        clearUI();
        M = { money: 100, publicSupport: 0, ethicalDecisions: 0 };
        currentRole = null;
        updateMetricsDisplay(); 

        mainGameAreaEl.style.filter = 'none';
        roleSelectionAreaEl.style.display = 'block';
        mainGameAreaEl.style.display = 'none';
        gameOverDisplayEl.style.display = 'none';
        gameOverDisplayEl.innerHTML = '';
        popupDisplayEl.style.display = 'none';
        roleConfirmationEl.style.display = 'none';


        document.getElementById('role-A-btn').onclick = () => handleRoleSelection('A');
        document.getElementById('role-B-btn').onclick = () => handleRoleSelection('B');
        document.getElementById('role-C-btn').onclick = () => handleRoleSelection('C');
        document.getElementById('role-D-btn').onclick = () => handleRoleSelection('D');
    }

    function handleRoleSelection(roleKey) {
        currentRole = roleKey;
        const initial = roleInitialEffects[currentRole];

        for (const k in initial.effects) {
            if (M.hasOwnProperty(k)) {
                M[k] += initial.effects[k];
            }
        }
        
        roleConfirmationEl.innerHTML = `You have chosen: <strong>${roles[currentRole]}</strong>. <p>${roleDescriptions[currentRole]}</p><em>${initial.text}</em>`;
        roleConfirmationEl.style.display = 'block';
        
        updateMetricsDisplay(); 

        setTimeout(() => {
            roleSelectionAreaEl.style.display = 'none';
            mainGameAreaEl.style.display = 'block';
            roleConfirmationEl.style.display = 'none'; 
            
            // Directly use the globally namespaced function for the button's onclick
            const roleConfirmedPopupContent = `You have chosen: <strong>${roles[currentRole]}</strong>. <p>${roleDescriptions[currentRole]}</p><em>${initial.text}</em><br/><button onclick="window.globalGameFunctions.clearPopupAndProceed(window.globalGameFunctions.startGameWithExhibitIntro)">Continue to Exhibit Introduction</button>`;
            showPopup(roleConfirmedPopupContent);

        }, 3500); 
    }

    // --- Exhibit Intros and Game Start Flow ---
    window.globalGameFunctions.startGameWithExhibitIntro = function() {
        clearUI();
        const introText = `<h3>Welcome to the Genomic Governance Simulator!</h3>
        <p>This game is part of a larger exploration of how genomics is shaped by more than just science. It mirrors <strong>Exhibit 1: The Four-Corner Cycle</strong>, showing how funding (Drivers), rules (Gatekeepers), technology (Tools), and public views (Meanings) all influence each other.</p>
        <p>You are about to step into <strong>Exhibit 4: The Simulator</strong> itself. As your chosen role, you'll make tough choices across three acts, experiencing these forces firsthand. Your decisions impact your budget, public support, and the ethical standing of your actions.
        
        </p>
        <p> Use to much money the game will end. Bad public support or ethical decisions will also end the game.
        `;
        setScene(introText);
        optionsDisplayEl.innerHTML = `<button onclick="window.globalGameFunctions.act1_exhibitIntro()">Begin Act I</button>`;
        popupDisplayEl.style.display = 'none'; 
    }

    window.globalGameFunctions.act1_exhibitIntro = function() {
        clearUI();
        const introText = `<h3>Preparing for Act I: The Hype Era</h3>
        <p>This act reflects <strong>Exhibit 2: CRISPR Headlines - "DNA 2.0!"</strong>. You're entering a period of immense optimism and hype around new gene-editing technologies. Big promises are made, and elite funding drives rapid development. Consider how you'll navigate this initial wave of excitement and investment.</p>`;
        setScene(introText);
        optionsDisplayEl.innerHTML = `<button onclick="window.globalGameFunctions.act1_subScenario1()">Start Act I</button>`;
    }

    window.globalGameFunctions.act2_exhibitIntro = function() {
        clearUI();
        const introText = `<h3>Preparing for Act II: Backlash and Reckoning</h3>
        <p>This act mirrors <strong>Exhibit 2: CRISPR Headlines - "CRISPR Uncut"</strong>. The initial shine is wearing off. Scandals, unexpected consequences, and public backlash are emerging. Regulatory bodies are forced to reckon with the rapid pace of development. How will you handle the fallout?</p>`;
        setScene(introText);
        optionsDisplayEl.innerHTML = `<button onclick="window.globalGameFunctions.act2_subScenario1()">Start Act II</button>`;
    }

    window.globalGameFunctions.act3_exhibitIntro = function() {
        clearUI();
        const introText = `<h3>Preparing for Act III: Contested Futures</h3>
        <p>This act corresponds to <strong>Exhibit 2: CRISPR Headlines - "Who Holds the Scalpel?"</strong>. The landscape is now fragmented. Community demands for control, data sovereignty claims, and competing visions for the future of genomics are central. Your choices will shape who truly benefits from these powerful tools.</p>`;
        setScene(introText);
        optionsDisplayEl.innerHTML = `<button onclick="window.globalGameFunctions.act3_subScenario1()">Start Act III</button>`;
    }

    // --- ACT 1 SCENARIOS ---
    window.globalGameFunctions.act1_subScenario1 = function() {
        clearUI();
        setScene(`<h3>ACT I - GENELIFE UNDER SCRUTINY</h3><p>GeneLife Corp's "Genesis Platform" launched (new, expensive, data from vulnerable groups, funding bias). Initial actions stir debate. Address concerns about GeneLife & Genesis Platform implications?<br/><strong>${roles[currentRole]}</strong>: Your move?</p>`);
        addBtn("<strong>Push GeneLife for lower prices:</strong> -$3M. (Leaning: Populist/Access-focused)", { money: -3, publicSupport: +2, ethicalDecisions: +1 }, window.globalGameFunctions.act1_subScenario2);
        addBtn("<strong>Fund data literacy for vulnerable groups:</strong> -$5M. (Leaning: Empowerment/Justice-focused)", { money: -5, publicSupport: +1, ethicalDecisions: +2 }, window.globalGameFunctions.act1_subScenario2);
        addBtn("<strong>Stay course, focus on innovation:</strong> No cost. (Leaning: Pro-Market/Tech-Optimist)", { money: 0, publicSupport: -1, ethicalDecisions: -1 }, window.globalGameFunctions.act1_subScenario2);
    }

    window.globalGameFunctions.act1_subScenario2 = function() {
        clearUI();
        setScene(`<h3>ACT I - EARLY WARNINGS</h3><p>Independent researchers suggest long-term risks with Genesis Platform. GeneLife dismisses them as theoretical. Your response?<br/><strong>${roles[currentRole]}</strong>: Your move?</p>`);
        addBtn("<strong>Commission further independent study:</strong> -$7M. (Leaning: Cautious/Evidence-based)", { money: -7, publicSupport: +1, ethicalDecisions: +2 }, window.globalGameFunctions.act2_exhibitIntro);
        addBtn("<strong>Pressure GeneLife for internal risk data:</strong> -$1M. (Leaning: Transparency-advocate)", { money: -1, publicSupport: +1, ethicalDecisions: +1 }, window.globalGameFunctions.act2_exhibitIntro);
        addBtn("<strong>Dismiss warnings, support GeneLife rollout:</strong> No cost. (Leaning: Anti-Regulation/Corporate-trust)", { money: 0, publicSupport: -2, ethicalDecisions: -2 }, window.globalGameFunctions.act2_exhibitIntro);
    }

    // --- ACT 2 SCENARIOS ---
    window.globalGameFunctions.act2_subScenario1 = function() {
        clearUI();
        setScene(`<h3>ACT II - WIDENING CRISIS</h3><p>GeneLife therapy harms ethnic group (data used in dev). 'Safety over justice' gap cited. Trust plummets. DIY kits fuel anxiety. Side effects appear in more groups. International calls for action. GeneLife stock tumbles.<br/><strong>${roles[currentRole]}</strong>: Your response?</p>`);
        addBtn("<strong>Propose international moratorium on GeneLife tech:</strong> -$3M. (Leaning: Global-Cooperation/Precautionary)", { money: -3, publicSupport: +2, ethicalDecisions: +1 }, window.globalGameFunctions.act2_subScenario2);
        addBtn("<strong>Fund global support network for affected:</strong> -$10M. (Leaning: Humanitarian/Reparative-Justice)", { money: -10, publicSupport: +3, ethicalDecisions: +2 }, window.globalGameFunctions.act2_subScenario2);
        addBtn("<strong>Double down on PR, blame faulty local application:</strong> -$8M. (Leaning: Corporate-Defense/Nationalist)", { money: -8, publicSupport: -3, ethicalDecisions: -3 }, window.globalGameFunctions.act2_subScenario2);
    }

    window.globalGameFunctions.act2_subScenario2 = function() {
        clearUI();
        setScene(`<h3>ACT II - CALLS FOR SYSTEMIC CHANGE</h3><p>Activists, emboldened by crisis, demand fundamental rethinking of genomic governance and corporate accountability. Your move?<br/><strong>${roles[currentRole]}</strong>: Your move?</p>`);
        addBtn("<strong>Support 'Peoples' Tribunal' on GeneLife:</strong> -$5M. (Leaning: Radical-Accountability/Victim-Centric)", { money: -5, publicSupport: +2, ethicalDecisions: +3 }, window.globalGameFunctions.act3_exhibitIntro);
        addBtn("<strong>Push for new global regulations on genomic data:</strong> -$8M. (Leaning: Systemic-Reform/Regulatory)", { money: -8, publicSupport: +1, ethicalDecisions: +1 }, window.globalGameFunctions.act3_exhibitIntro);
        addBtn("<strong>Offer GeneLife bailout with strict reform conditions:</strong> -$15M. (Leaning: Pragmatic-Control/State-Intervention)", { money: -15, publicSupport: -1, ethicalDecisions: 0 }, window.globalGameFunctions.act3_exhibitIntro);
    }

    // --- ACT 3 SCENARIOS ---
    window.globalGameFunctions.act3_subScenario1 = function() {
        clearUI();
        setScene(`<h3>ACT III - DECENTRALIZATION DILEMMAS</h3><p>Bio-hackers use leaked data for DIY therapies (risky). 'Bio-prospecting' debate: firms take Indigenous genetic info unfairly. DIY bio communities grow; some success, some incidents. Balance innovation/safety?<br/><strong>${roles[currentRole]}</strong>: Your action?</p>`);
        addBtn("<strong>Fund open-source safety protocols for DIY bio:</strong> -$7M. (Leaning: Harm-Reduction/Decentralist-Support)", { money: -7, publicSupport: +1, ethicalDecisions: +1 }, window.globalGameFunctions.act3_subScenario2);
        addBtn("<strong>Establish 'Genomic Free Zones' with oversight:</strong> -$10M. (Leaning: Experimental/Managed-Risk)", { money: -10, publicSupport: 0, ethicalDecisions: 0 }, window.globalGameFunctions.act3_subScenario2);
        addBtn("<strong>Crackdown on unregulated bio-hacking:</strong> -$3M. (Leaning: Statist/Control-Oriented)", { money: -3, publicSupport: -2, ethicalDecisions: -1 }, window.globalGameFunctions.act3_subScenario2);
    }

    window.globalGameFunctions.act3_subScenario2 = function() {
        clearUI();
        setScene(`<h3>ACT III - LEGACIES OF KNOWLEDGE</h3><p>Indigenous groups demand repatriation of genetic data held by corporations/researchers, asserting sovereignty over their biological heritage. Your stance?<br/><strong>${roles[currentRole]}</strong>: Your move?</p>`);
        addBtn("<strong>Legislate mandatory data repatriation:</strong> -$5M. (Leaning: Decolonial/Sovereignty-Affirming)", { money: -5, publicSupport: +1, ethicalDecisions: +3 }, epilogue);
        addBtn("<strong>Mediate benefit-sharing agreements:</strong> -$3M. (Leaning: Pragmatic-Compromise/Reformist)", { money: -3, publicSupport: +1, ethicalDecisions: +1 }, epilogue);
        addBtn("<strong>Protect corporate IP, resist repatriation:</strong> No cost. (Leaning: Pro-Corporate/Status-Quo)", { money: 0, publicSupport: -2, ethicalDecisions: -3 }, epilogue);
    }

    function epilogue() {
        clearUI(false); 
        let title = "";
        let narrative = "";

        if (M.money < 0 && gameOverDisplayEl.style.display !== 'block') { 
             triggerGameOver("You've gone bankrupt! Your influence collapses under financial ruin.");
             title = "The Price of Ambition: Financial Ruin";
             narrative = "The financial burden became too great. Your role in shaping the genomic future ended not with a bang, but with the quiet closing of accounts. Money, public will, and ethical decisions proved too challenging to balance.";
        } else if (M.publicSupport < -2 && M.ethicalDecisions < -2) {
            title = "The Unheard Warning: Ethical Collapse";
            narrative = `As <strong>${roles[currentRole]}</strong>, your path led to a fractured society. A lack of public trust combined with severe ethical failings created deep divisions. The promise of genomics became a source of fear and resentment, and the crucial element of moral leadership was lost.`;
        } else if (M.money > 50 && M.publicSupport <= 0 && M.ethicalDecisions <= 0) {
            title = "The Gilded Cage: Profit Over People and Principles";
            narrative = `As <strong>${roles[currentRole]}</strong>, your actions secured financial success, but at a steep cost. Public support waned, and ethical principles were largely sidelined. The genomic future is technologically advanced and profitable for some, but lacks a moral compass and faces simmering discontent.`;
        } else if (M.publicSupport >= 5 && M.ethicalDecisions >= 5 && M.money > 0) {
            title = "The Beacon of Integrity: Trust, Ethics, and Prosperity";
            narrative = `As <strong>${roles[currentRole]}</strong>, your dedicated efforts to foster public trust and uphold strong ethical decisions have woven a new narrative for genomics. Technologies are developed with justice and fairness, respecting human dignity. This future is characterized by broad societal consensus, moral clarity, and sustainable progress.`;
        } else if (M.ethicalDecisions >= 6 && M.publicSupport <= 1 && M.money > -10) {
            title = "The Ivory Tower of Ethics: Principled but Isolated";
            narrative = `As <strong>${roles[currentRole]}</strong>, you championed a future rich in ethical decision-making. However, broader public engagement proved elusive, or financial constraints limited impact. While moral integrity is high, its benefits are not widespread, creating pockets of principle in a world needing broader ethical application.`;
        } else if (M.publicSupport >= 6 && M.ethicalDecisions <= 1 && M.money > -10) {
            title = "The People's Will: Popular Support, Questionable Ethics";
            narrative = `As <strong>${roles[currentRole]}</strong>, you successfully rallied strong public support. However, this popular wave may have sometimes overlooked or compromised on key ethical principles. While democratic, the approach might lack the profound moral grounding needed for long-term, just outcomes.`;
        } else if (M.money > 20 && M.publicSupport > 2 && M.ethicalDecisions > 2) {
             title = "The Pragmatic Ethicist: A Balanced, Imperfect Path";
             narrative = `As <strong>${roles[currentRole]}</strong>, you skillfully navigated finance, public opinion, and ethical demands. No single aspect was perfect, but a functional equilibrium was achieved. The genomic future is one of ongoing dialogue, where economic realities, public voice, and ethical considerations all strive for a balanced path.`;
        }
        else { 
            title = "An Uncharted Moral Landscape: The Genomic Voyage Continues";
            narrative = `As <strong>${roles[currentRole]}</strong>, your journey has left its mark, yet the ultimate moral trajectory remains open. The interplay of finance, public support, and ethical decisions continues to shape this frontier. The future of genomics is still being written, a complex narrative of ambition, moral deliberation, and the quest for a just path.`;
        }

        const epilogueHTML = `
        <h3>EPILOGUE – Year 2050</h3>
        <div style="border-top: 1px solid #ddd; padding-top:10px; margin-top:10px;">
            <p>Chosen Role: <strong>${roles[currentRole]}</strong></p>
            <p>Final Metrics: <br>
                &nbsp;&nbsp;Money: $${M.money}M<br>
                &nbsp;&nbsp;Public Support: ${M.publicSupport}<br>
                &nbsp;&nbsp;Ethical Decisions: ${M.ethicalDecisions} 
            </p>
        </div>
        <h4 style="margin-top:20px; color: #333;">${title}</h4>
        <p>${narrative}</p>
        <p style="font-size: 0.9em; margin-top: 20px; border-top: 1px solid #ddd; padding-top:10px;">
            <em>This simulation explored how governing gene editing involves balancing financial realities, public sentiment, and making sound ethical decisions. Your choices highlighted the tension between market forces, community well-being, and the moral imperative to act justly, transparently, and with foresight.</em>
        </p>
        <p>Thank you for navigating these complex decisions.</p>`;
        
        setScene(epilogueHTML); 
        popupDisplayEl.style.display = 'none'; 

        optionsDisplayEl.innerHTML = `<button onclick="window.globalGameFunctions.chooseRole()">Play Again?</button>`;
    }

    // --- Initialization ---
    window.globalGameFunctions.chooseRole(); 
});