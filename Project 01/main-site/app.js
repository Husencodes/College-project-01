/**
 * Ganesh 3D - Main JavaScript
 * Handles navigation, interactive 3D, digital pooja state, quiz logic, local storage, and gallery modal.
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    init3DDisplay();
    initAboutCards();
    initQuiz();
    initMemories();
    initGallery();
});

/* ==========================================================================
   1. Navigation & Mobile Menu
   ========================================================================== */
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        });
    });

    // Active link update on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

/* ==========================================================================
   2. Interactive 3D Display (Mouse Parallax & Zoom Controls)
   ========================================================================== */
function init3DDisplay() {
    const stage = document.getElementById('stage');
    const card = document.getElementById('ganesha-card');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const rotateBtn = document.getElementById('rotate-toggle');
    const resetBtn = document.getElementById('reset-view');

    let scale = 1;
    let autoRotate = false;
    let rotateDegree = 0;
    let animationId = null;

    if (!stage || !card) return;

    // Mouse Parallax Effect
    stage.addEventListener('mousemove', (e) => {
        if (autoRotate) return;
        const rect = stage.getBoundingClientRect();
        const x = e.clientX - rect.left - (rect.width / 2);
        const y = e.clientY - rect.top - (rect.height / 2);
        
        const rotateX = (-y / rect.height) * 30;
        const rotateY = (x / rect.width) * 30;

        card.style.transform = `scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    stage.addEventListener('mouseleave', () => {
        if (!autoRotate) {
            card.style.transform = `scale(${scale}) rotateX(0deg) rotateY(0deg)`;
        }
    });

    // Zoom Controls
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            if (scale < 1.4) scale += 0.1;
            applyTransform();
        });
    }

    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            if (scale > 0.7) scale -= 0.1;
            applyTransform();
        });
    }

    // Auto Rotate Toggle
    if (rotateBtn) {
        rotateBtn.addEventListener('click', () => {
            autoRotate = !autoRotate;
            if (autoRotate) {
                rotateBtn.style.background = 'var(--primary-color)';
                animateRotation();
            } else {
                rotateBtn.style.background = 'var(--bg-card)';
                cancelAnimationFrame(animationId);
                applyTransform();
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            scale = 1;
            autoRotate = false;
            rotateBtn.style.background = 'var(--bg-card)';
            cancelAnimationFrame(animationId);
            card.style.transform = `scale(1) rotateX(0deg) rotateY(0deg)`;
        });
    }

    function animateRotation() {
        if (!autoRotate) return;
        rotateDegree = (rotateDegree + 1) % 360;
        card.style.transform = `scale(${scale}) rotateY(${rotateDegree}deg)`;
        animationId = requestAnimationFrame(animateRotation);
    }

    function applyTransform() {
        card.style.transform = `scale(${scale})`;
    }
}

/* ==========================================================================
   3. Digital Pooja State Management
   ========================================================================== */
 document.addEventListener('DOMContentLoaded', () => {
            const STEPS = {
                0: { name: "Diya Lighting", hint: "Pick up the matchstick and drag it to the Diya wick." },
                1: { name: "Pushpa Offering", hint: "Drag flowers to Ganesha (0/3 offered)." },
                2: { name: "Durva Offering", hint: "Drag the Durva grass to Ganesha." },
                3: { name: "Naivedya Offering", hint: "Drag Modaks to Ganesha's tray." },
                4: { name: "Dhoop / Incense", hint: "Drag the incense stick to the holder." },
                5: { name: "Temple Bell", hint: "Tap/Click the hanging bell to ring it." },
                6: { name: "Aarti Ceremony", hint: "Hold the Aarti plate and rotate it around Ganesha in circles." },
                7: { name: "Namaskar", hint: "Press and hold the Namaskar button to pray." },
                8: { name: "Completed", hint: "Pooja Completed successfully!" }
            };

            const state = {
                currentStep: 0,
                flowersOffered: 0,
                requiredFlowers: 3,
                modaksOffered: 0,
                requiredModaks: 2,
                aartiAngleTotal: 0,
                lastAartiAngle: null,
                poojaCount: parseInt(localStorage.getItem('g3d_pooja_count') || '0')
            };

            const stepIndicator = document.getElementById('step-indicator');
            const stepName = document.getElementById('step-name');
            const progressFill = document.getElementById('progress-fill');
            const toast = document.getElementById('toast-instruction');
            const statsBadge = document.getElementById('pooja-stats');
            const ganeshaContainer = document.getElementById('ganesha-container');
            const dropZone = document.getElementById('drop-zone-ganesha');
            const divineHalo = document.getElementById('divine-halo');
            const offeredItemsLayer = document.getElementById('offered-items-layer');

            function updateUI() {
                stepIndicator.innerText = `Step ${state.currentStep + 1} / 8`;
                stepName.innerText = STEPS[state.currentStep].name;
                progressFill.style.width = `${((state.currentStep) / 8) * 100}%`;
                toast.innerText = STEPS[state.currentStep].hint;
                statsBadge.innerText = `Completed: ${state.poojaCount}`;

                if (state.currentStep === 1) {
                    toast.innerText = `Drag flowers to Ganesha (${state.flowersOffered}/${state.requiredFlowers} offered).`;
                }
                
                document.getElementById('btn-a11y-action').innerText = `Skip/Perform: ${STEPS[state.currentStep].name}`;
            }

            function advanceStep() {
                if (state.currentStep < 8) {
                    state.currentStep++;
                    updateUI();
                    if (state.currentStep === 7) {
                        document.getElementById('namaskar-zone').classList.remove('hidden');
                    } else if (state.currentStep === 8) {
                        completePooja();
                    }
                }
            }

            document.getElementById('btn-start-pooja').addEventListener('click', () => {
                document.getElementById('welcome-modal').classList.add('hidden');
                audioMgr.init();
                audioMgr.enabled = true;
                updateUI();
            });

            document.getElementById('btn-toggle-audio').addEventListener('click', (e) => {
                const active = audioMgr.toggleSound();
                e.target.innerText = active ? "🔊" : "🔇";
            });

            document.getElementById('btn-restart').addEventListener('click', () => {
                resetPoojaState();
            });

            document.getElementById('btn-restart-final').addEventListener('click', () => {
                document.getElementById('completion-modal').classList.add('hidden');
                resetPoojaState();
            });

            function resetPoojaState() {
                state.currentStep = 0;
                state.flowersOffered = 0;
                state.modaksOffered = 0;
                state.aartiAngleTotal = 0;
                state.lastAartiAngle = null;

                offeredItemsLayer.innerHTML = '';
                document.getElementById('diya-flame').classList.add('hidden');
                divineHalo.classList.remove('illuminated');
                document.getElementById('matchstick').classList.remove('disabled');
                
                document.querySelectorAll('.draggable-item').forEach(el => el.classList.remove('disabled'));
                document.getElementById('namaskar-zone').classList.add('hidden');
                
                updateUI();
            }

            document.getElementById('btn-a11y-action').addEventListener('click', () => {
                if (state.currentStep === 0) lightDiya();
                else if (state.currentStep === 1) {
                    state.flowersOffered = state.requiredFlowers;
                    advanceStep();
                } else if (state.currentStep === 2) advanceStep();
                else if (state.currentStep === 3) advanceStep();
                else if (state.currentStep === 4) lightIncense();
                else if (state.currentStep === 5) ringBell();
                else if (state.currentStep === 6) completeAarti();
                else if (state.currentStep === 7) completeNamaskar();
            });

            function makeDraggable(element, onDropCheck) {
                let startX = 0, startY = 0;

                element.addEventListener('pointerdown', (e) => {
                    e.preventDefault();
                    element.setPointerCapture(e.pointerId);
                    startX = e.clientX;
                    startY = e.clientY;
                    element.style.transition = 'none';
                    element.style.zIndex = 1000;
                });

                element.addEventListener('pointermove', (e) => {
                    if (!element.hasPointerCapture(e.pointerId)) return;
                    const dx = e.clientX - startX;
                    const dy = e.clientY - startY;
                    element.style.transform = `translate(${dx}px, ${dy}px)`;
                });

                element.addEventListener('pointerup', (e) => {
                    if (!element.hasPointerCapture(e.pointerId)) return;
                    element.releasePointerCapture(e.pointerId);
                    
                    const dropSuccess = onDropCheck(e.clientX, e.clientY, element);

                    if (!dropSuccess) {
                        element.style.transition = 'transform 0.3s ease';
                        element.style.transform = 'translate(0px, 0px)';
                    }
                });
            }

            // Step 1: Diya Lighting
            const matchstick = document.getElementById('matchstick');
            const diyaWick = document.getElementById('diya-wick');

            makeDraggable(matchstick, (x, y) => {
                if (state.currentStep !== 0) return false;
                const wickRect = diyaWick.getBoundingClientRect();
                const dist = Math.hypot(x - (wickRect.left + wickRect.width/2), y - (wickRect.top + wickRect.height/2));

                if (dist < 40) {
                    lightDiya();
                    return true;
                }
                return false;
            });

            function lightDiya() {
                document.getElementById('diya-flame').classList.remove('hidden');
                divineHalo.classList.add('illuminated');
                matchstick.classList.add('disabled');
                audioMgr.playDiya();
                advanceStep();
            }

            // Steps 2, 3, 4: Drag & Drop Offerings
            const draggables = document.querySelectorAll('.draggable-item');
            draggables.forEach(item => {
                const type = item.dataset.type;
                if (!type) return;

                makeDraggable(item, (x, y, el) => {
                    const targetRect = dropZone.getBoundingClientRect();
                    const inside = (
                        x >= targetRect.left && x <= targetRect.right &&
                        y >= targetRect.top && y <= targetRect.bottom
                    );

                    if (inside) {
                        if (type === 'flower' && state.currentStep === 1) {
                            offerFlower(el, x, y);
                            return true;
                        } else if (type === 'durva' && state.currentStep === 2) {
                            offerDurva(el, x, y);
                            return true;
                        } else if (type === 'modak' && state.currentStep === 3) {
                            offerModak(el, x, y);
                            return true;
                        }
                    }
                    return false;
                });
            });

            function spawnLandedItem(symbol, x, y) {
                const containerRect = ganeshaContainer.getBoundingClientRect();
                const relX = x - containerRect.left;
                const relY = y - containerRect.top;

                const landed = document.createElement('div');
                landed.className = 'landed-offering';
                landed.innerText = symbol;
                landed.style.left = `${relX}px`;
                landed.style.top = `${relY}px`;
                offeredItemsLayer.appendChild(landed);
            }

            function offerFlower(el, x, y) {
                el.classList.add('disabled');
                spawnLandedItem(el.innerText, x, y);
                audioMgr.playOffering();
                state.flowersOffered++;
                if (state.flowersOffered >= state.requiredFlowers) {
                    advanceStep();
                } else {
                    updateUI();
                }
            }

            function offerDurva(el, x, y) {
                el.classList.add('disabled');
                spawnLandedItem(el.innerText, x, y);
                audioMgr.playOffering();
                advanceStep();
            }

            function offerModak(el, x, y) {
                el.classList.add('disabled');
                spawnLandedItem(el.innerText, x, y);
                audioMgr.playOffering();
                state.modaksOffered++;
                if (state.modaksOffered >= state.requiredModaks) {
                    advanceStep();
                }
            }

            // Step 5: Dhoop / Incense
            const incenseStick = document.getElementById('incense-stick');
            const incenseHolder = document.getElementById('incense-holder');

            makeDraggable(incenseStick, (x, y) => {
                if (state.currentStep !== 4) return false;
                const rect = incenseHolder.getBoundingClientRect();
                if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                    lightIncense();
                    return true;
                }
                return false;
            });

            function lightIncense() {
                incenseStick.classList.add('disabled');
                const smokeContainer = document.getElementById('smoke-container');
                setInterval(() => {
                    const puff = document.createElement('div');
                    puff.className = 'smoke-puff';
                    smokeContainer.appendChild(puff);
                    setTimeout(() => puff.remove(), 2000);
                }, 400);
                audioMgr.playDiya();
                advanceStep();
            }

            // Step 6: Temple Bell
            const bell = document.getElementById('hanging-bell');
            bell.addEventListener('click', ringBell);

            function ringBell() {
                if (state.currentStep !== 5) return;
                bell.classList.add('bell-ring-anim');
                audioMgr.playBell();
                setTimeout(() => {
                    bell.classList.remove('bell-ring-anim');
                    advanceStep();
                }, 1200);
            }

            // Step 7: Aarti Circular Motion
            const aartiPlate = document.getElementById('aarti-plate');
            const aartiFlame = document.getElementById('aarti-flame');
            let trackingAarti = false;

            aartiPlate.addEventListener('pointerdown', (e) => {
                if (state.currentStep !== 6) return;
                trackingAarti = true;
                aartiPlate.setPointerCapture(e.pointerId);
                aartiFlame.classList.remove('hidden');
                state.lastAartiAngle = null;
            });

            aartiPlate.addEventListener('pointermove', (e) => {
                if (!trackingAarti || state.currentStep !== 6) return;

                const gRect = ganeshaContainer.getBoundingClientRect();
                const gCenterX = gRect.left + gRect.width / 2;
                const gCenterY = gRect.top + gRect.height / 2;

                aartiPlate.style.transform = `translate(${e.clientX - gCenterX}px, ${e.clientY - gCenterY + 100}px)`;

                const rad = Math.atan2(e.clientY - gCenterY, e.clientX - gCenterX);
                const deg = rad * (180 / Math.PI);

                if (state.lastAartiAngle !== null) {
                    let delta = deg - state.lastAartiAngle;
                    if (delta > 180) delta -= 360;
                    if (delta < -180) delta += 360;
                    state.aartiAngleTotal += Math.abs(delta);

                    if (state.aartiAngleTotal >= 1080) {
                        trackingAarti = false;
                        completeAarti();
                    }
                }
                state.lastAartiAngle = deg;
            });

            aartiPlate.addEventListener('pointerup', (e) => {
                if (!trackingAarti) return;
                trackingAarti = false;
                aartiPlate.style.transform = 'translate(0px, 0px)';
            });

            function completeAarti() {
                aartiFlame.classList.add('hidden');
                aartiPlate.style.transform = 'translate(0px, 0px)';
                audioMgr.playOffering();
                advanceStep();
            }

            // Step 8: Namaskar
            const btnNamaskar = document.getElementById('btn-namaskar');
            const progressCircle = document.querySelector('.progress-ring__circle');
            let holdTimer = null;
            let holdProgress = 0;

            function startHold(e) {
                if (state.currentStep !== 7) return;
                e.preventDefault();
                holdProgress = 0;
                holdTimer = setInterval(() => {
                    holdProgress += 5;
                    const offset = 326.72 - (holdProgress / 100) * 326.72;
                    progressCircle.style.strokeDashoffset = offset;

                    if (holdProgress >= 100) {
                        clearInterval(holdTimer);
                        completeNamaskar();
                    }
                }, 100);
            }

            function endHold() {
                if (holdTimer) clearInterval(holdTimer);
                holdProgress = 0;
                progressCircle.style.strokeDashoffset = 326.72;
            }

            btnNamaskar.addEventListener('pointerdown', startHold);
            btnNamaskar.addEventListener('pointerup', endHold);
            btnNamaskar.addEventListener('pointerleave', endHold);

            function completeNamaskar() {
                document.getElementById('namaskar-zone').classList.add('hidden');
                advanceStep();
            }

            // Final Completion
            function completePooja() {
                state.poojaCount++;
                localStorage.setItem('g3d_pooja_count', state.poojaCount.toString());

                const summary = document.getElementById('pooja-summary');
                summary.innerHTML = `
                    <p>🌸 Flowers Offered: ${state.flowersOffered}</p>
                    <p>🥟 Modaks Offered: ${state.modaksOffered}</p>
                    <p>🪔 Aarti Rotations: 3</p>
                    <p> Total Completed Poojas: ${state.poojaCount}</p>
                `;

                document.getElementById('completion-modal').classList.remove('hidden');
            }
        });
/* ==========================================================================
   4. About Section Expandable Cards
   ========================================================================== */
function initAboutCards() {
    const readMoreBtns = document.querySelectorAll('.read-more-btn');

    readMoreBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.parentElement;
            const fullContent = card.querySelector('.card-full-content');

            if (fullContent.style.display === 'block') {
                fullContent.style.display = 'none';
                btn.textContent = 'Read More';
            } else {
                fullContent.style.display = 'block';
                btn.textContent = 'Show Less';
            }
        });
    });
}

/* ==========================================================================
   5. Interactive Quiz System
   ========================================================================== */
const questions = [
    { question: "Lord Ganesha is traditionally considered the son of which divine couple?", options: ["Vishnu & Lakshmi", "Shiva & Parvati", "Brahma & Saraswati", "Rama & Sita"], answer: "Shiva & Parvati" },
    { question: "What is the favorite sweet delicacy of Lord Ganesha?", options: ["Jalebi", "Gulab Jamun", "Modak", "Rasgulla"], answer: "Modak" },
    { question: "Which vehicle (Vahana) is associated with Lord Ganesha?", options: ["Peacock", "Mouse (Mooshak)", "Eagle (Garuda)", "Bull (Nandi)"], answer: "Mouse (Mooshak)" },
    { question: "Ganesh Chaturthi marks which significant event?", options: ["Ganesha's victory in battle", "The birth/rebirth of Ganesha", "Ganesha's marriage", "The start of New Year"], answer: "The birth/rebirth of Ganesha" },
    { question: "How many days is Ganesh Chaturthi traditionally celebrated?", options: ["3 Days", "5 Days", "10 Days", "14 Days"], answer: "10 Days" },
    { question: "Which plant leaf is considered sacred and offered to Lord Ganesha?", options: ["Tulsi", "Durva Grass", "Neem", "Banyan Leaf"], answer: "Durva Grass" },
    { question: "What does Ganesha's large trunk symbolize?", options: ["Strength & Adaptability", "Anger", "Pride", "Silence"], answer: "Strength & Adaptability" },
    { question: "What is the ritual immersion of Ganesha idols in water called?", options: ["Visarjan", "Aarti", "Sankalpa", "Pradakshina"], answer: "Visarjan" },
    { question: "Why is eco-friendly clay Ganesha recommended?", options: ["It dissolves safely in water", "It is cheaper", "It looks brighter", "It is heavier"], answer: "It dissolves safely in water" },
    { question: "Which festival title means 'remover of obstacles'?", options: ["Vighnaharta", "Mahadeva", "Pitambara", "Gangadhara"], answer: "Vighnaharta" }
];

function initQuiz() {
    let currentQ = 0;
    let score = 0;
    let selectedAnswer = null;

    const startBtn = document.getElementById('start-quiz-btn');
    const startScreen = document.getElementById('quiz-start-screen');
    const questionScreen = document.getElementById('quiz-question-screen');
    const resultScreen = document.getElementById('quiz-result-screen');

    const progressText = document.getElementById('quiz-progress-text');
    const liveScoreText = document.getElementById('quiz-score-live');
    const progressBar = document.getElementById('quiz-progress-bar');
    const qTitle = document.getElementById('quiz-question-title');
    const optionsContainer = document.getElementById('options-container');

    const prevBtn = document.getElementById('quiz-prev-btn');
    const nextBtn = document.getElementById('quiz-next-btn');
    const restartQuizBtn = document.getElementById('restart-quiz-btn');

    if (!startBtn) return;

    startBtn.addEventListener('click', () => {
        startScreen.classList.remove('active');
        questionScreen.classList.add('active');
        loadQuestion();
    });

    function loadQuestion() {
        const q = questions[currentQ];
        progressText.textContent = `Question ${currentQ + 1} / ${questions.length}`;
        liveScoreText.textContent = `Score: ${score}`;
        progressBar.style.width = `${((currentQ + 1) / questions.length) * 100}%`;
        qTitle.textContent = q.question;

        optionsContainer.innerHTML = '';
        selectedAnswer = null;
        nextBtn.disabled = true;
        prevBtn.disabled = currentQ === 0;

        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            btn.addEventListener('click', () => selectOption(btn, opt, q.answer));
            optionsContainer.appendChild(btn);
        });
    }

    function selectOption(btn, chosen, correct) {
        const allBtns = optionsContainer.querySelectorAll('.option-btn');
        allBtns.forEach(b => b.classList.remove('selected', 'correct', 'wrong'));

        selectedAnswer = chosen;
        nextBtn.disabled = false;

        if (chosen === correct) {
            btn.classList.add('correct');
        } else {
            btn.classList.add('wrong');
        }
    }

    nextBtn.addEventListener('click', () => {
        if (selectedAnswer === questions[currentQ].answer) {
            score++;
        }

        if (currentQ < questions.length - 1) {
            currentQ++;
            loadQuestion();
        } else {
            showResults();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentQ > 0) {
            currentQ--;
            loadQuestion();
        }
    });

    function showResults() {
        questionScreen.classList.remove('active');
        resultScreen.classList.add('active');

        const percentage = Math.round((score / questions.length) * 100);
        document.getElementById('score-percentage').textContent = `${percentage}%`;
        document.getElementById('score-summary').textContent = `You scored ${score} out of ${questions.length}`;

        const feedback = document.getElementById('score-feedback');
        if (percentage >= 80) feedback.textContent = "🌟 Excellent! You have deep knowledge of traditions!";
        else if (percentage >= 50) feedback.textContent = "👍 Good Job! You know your festivities well.";
        else feedback.textContent = "🙏 Keep exploring and learning about Lord Ganesha!";
    }

    restartQuizBtn.addEventListener('click', () => {
        currentQ = 0;
        score = 0;
        resultScreen.classList.remove('active');
        startScreen.classList.add('active');
    });
}

/* ==========================================================================
   6. Memory Sharing with LocalStorage
   ========================================================================== */
function initMemories() {
    const form = document.getElementById('memory-form');
    const imageInput = document.getElementById('mem-image');
    const imagePreview = document.getElementById('image-preview');
    const grid = document.getElementById('memories-grid');

    let previewBase64 = '';

    if (!form) return;

    // Image Upload Preview
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                previewBase64 = evt.target.result;
                imagePreview.innerHTML = `<img src="${previewBase64}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // Load initial memories
    loadMemories();

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('mem-name').value;
        const title = document.getElementById('mem-title').value;
        const year = document.getElementById('mem-year').value;
        const desc = document.getElementById('mem-desc').value;

        const newMemory = {
            id: Date.now(),
            name,
            title,
            year,
            desc,
            image: previewBase64
        };

        const memories = getStoredMemories();
        memories.unshift(newMemory);
        localStorage.setItem('ganesh_memories', JSON.stringify(memories));

        form.reset();
        imagePreview.innerHTML = '<span>Image Preview</span>';
        previewBase64 = '';
        loadMemories();
    });

    function getStoredMemories() {
        return JSON.parse(localStorage.getItem('ganesh_memories') || '[]');
    }

    function loadMemories() {
        const memories = getStoredMemories();
        grid.innerHTML = '';

        if (memories.length === 0) {
            grid.innerHTML = '<p style="color:var(--text-muted);">No memories shared yet. Be the first!</p>';
            return;
        }

        memories.forEach(mem => {
            const card = document.createElement('div');
            card.className = 'memory-card glass-panel';
            card.innerHTML = `
                <button class="delete-mem-btn" data-id="${mem.id}">Delete</button>
                <h4>${escapeHTML(mem.title)}</h4>
                <div class="mem-meta">By ${escapeHTML(mem.name)} • ${escapeHTML(mem.year)}</div>
                <p>${escapeHTML(mem.desc)}</p>
                ${mem.image ? `<img src="${mem.image}" alt="${escapeHTML(mem.title)}">` : ''}
            `;

            grid.appendChild(card);
        });

        // Delete Event Listeners
        document.querySelectorAll('.delete-mem-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                let memories = getStoredMemories();
                memories = memories.filter(m => m.id !== id);
                localStorage.setItem('ganesh_memories', JSON.stringify(memories));
                loadMemories();
            });
        });
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }
}

/* ==========================================================================
   7. Gallery Lightbox
   ========================================================================== */
function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxVisual = document.getElementById('lightbox-visual');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    let currentIndex = 0;

    if (!lightbox) return;

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            currentIndex = parseInt(item.getAttribute('data-index'));
            openLightbox(item);
        });
    });

    function openLightbox(item) {
        const placeholder = item.querySelector('.gallery-placeholder').cloneNode(true);
        const caption = item.getAttribute('data-caption');

        lightboxVisual.innerHTML = '';
        lightboxVisual.appendChild(placeholder);
        lightboxCaption.textContent = caption;

        lightbox.classList.add('active');
    }

    closeBtn.addEventListener('click', () => lightbox.classList.remove('active'));

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
        openLightbox(galleryItems[currentIndex]);
    });

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % galleryItems.length;
        openLightbox(galleryItems[currentIndex]);
    });
}
// --- VIEW SWITCHER ---
        function switchView(viewName) {
            const landingView = document.getElementById('landing-view');
            const poojaView = document.getElementById('pooja-view');

            if (viewName === 'pooja') {
                landingView.classList.add('hidden');
                poojaView.classList.remove('hidden');
                document.getElementById('welcome-modal').classList.remove('hidden');
            } else {
                poojaView.classList.add('hidden');
                landingView.classList.remove('hidden');
            }
        }

        // --- LANDING PAGE BACKGROUND PARTICLES ---
        document.addEventListener('DOMContentLoaded', () => {
            const particlesContainer = document.getElementById('particles');
            if (particlesContainer) {
                for (let i = 0; i < 25; i++) {
                    const p = document.createElement('div');
                    p.style.position = 'absolute';
                    p.style.width = `${Math.random() * 6 + 2}px`;
                    p.style.height = p.style.width;
                    p.style.backgroundColor = '#FFD700';
                    p.style.borderRadius = '50%';
                    p.style.opacity = Math.random() * 0.6 + 0.2;
                    p.style.left = `${Math.random() * 100}%`;
                    p.style.top = `${Math.random() * 100}%`;
                    p.style.boxShadow = '0 0 8px #FFD700';
                    
                    p.animate([
                        { transform: 'translateY(0px)', opacity: p.style.opacity },
                        { transform: `translateY(-${Math.random() * 100 + 50}px)`, opacity: 0 }
                    ], {
                        duration: Math.random() * 3000 + 3000,
                        iterations: Infinity
                    });

                    particlesContainer.appendChild(p);
                }
            }
        });

        // --- SOUND SYNTHESIZER ---
        class SoundManager {
            constructor() {
                this.ctx = null;
                this.enabled = false;
                this.volume = 0.3;
            }

            init() {
                if (!this.ctx) {
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    this.ctx = new AudioContext();
                }
                if (this.ctx.state === 'suspended') {
                    this.ctx.resume();
                }
            }

            toggleSound() {
                this.enabled = !this.enabled;
                if (this.enabled) this.init();
                return this.enabled;
            }

            playBell() {
                if (!this.enabled || !this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 1.2);

                gain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start();
                osc.stop(this.ctx.currentTime + 1.2);
            }

            playOffering() {
                if (!this.enabled || !this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(523.25, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(659.25, this.ctx.currentTime + 0.3);

                gain.gain.setValueAtTime(this.volume * 0.5, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start();
                osc.stop(this.ctx.currentTime + 0.3);
            }

            playDiya() {
                if (!this.enabled || !this.ctx) return;
                const bufferSize = this.ctx.sampleRate * 0.2;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }

                const noise = this.ctx.createBufferSource();
                noise.buffer = buffer;

                const filter = this.ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = 1000;

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(this.volume * 0.4, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

                noise.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);

                noise.start();
            }
        }

        const audioMgr = new SoundManager();

        // --- POOJA ROOM ENGINE ---
        document.addEventListener('DOMContentLoaded', () => {
            const STEPS = {
                0: { name: "Diya Lighting", hint: "Pick up the matchstick and drag it to the Diya wick." },
                1: { name: "Pushpa Offering", hint: "Drag flowers to Ganesha (0/3 offered)." },
                2: { name: "Durva Offering", hint: "Drag the Durva grass to Ganesha." },
                3: { name: "Naivedya Offering", hint: "Drag Modaks to Ganesha's tray." },
                4: { name: "Dhoop / Incense", hint: "Drag the incense stick to the holder." },
                5: { name: "Temple Bell", hint: "Tap/Click the hanging bell to ring it." },
                6: { name: "Aarti Ceremony", hint: "Hold the Aarti plate and rotate it around Ganesha in circles." },
                7: { name: "Namaskar", hint: "Press and hold the Namaskar button to pray." },
                8: { name: "Completed", hint: "Pooja Completed successfully!" }
            };

            const state = {
                currentStep: 0,
                flowersOffered: 0,
                requiredFlowers: 3,
                modaksOffered: 0,
                requiredModaks: 2,
                aartiAngleTotal: 0,
                lastAartiAngle: null,
                poojaCount: parseInt(localStorage.getItem('g3d_pooja_count') || '0')
            };

            const stepIndicator = document.getElementById('step-indicator');
            const stepName = document.getElementById('step-name');
            const progressFill = document.getElementById('progress-fill');
            const toast = document.getElementById('toast-instruction');
            const statsBadge = document.getElementById('pooja-stats');
            const ganeshaContainer = document.getElementById('ganesha-container');
            const dropZone = document.getElementById('drop-zone-ganesha');
            const divineHalo = document.getElementById('divine-halo');
            const offeredItemsLayer = document.getElementById('offered-items-layer');

            if (!stepIndicator || !stepName || !progressFill || !toast || !statsBadge || !ganeshaContainer || !dropZone || !divineHalo || !offeredItemsLayer) {
                return;
            }

            function updateUI() {
                stepIndicator.innerText = `Step ${state.currentStep + 1} / 8`;
                stepName.innerText = STEPS[state.currentStep].name;
                progressFill.style.width = `${((state.currentStep) / 8) * 100}%`;
                toast.innerText = STEPS[state.currentStep].hint;
                statsBadge.innerText = `Completed: ${state.poojaCount}`;

                if (state.currentStep === 1) {
                    toast.innerText = `Drag flowers to Ganesha (${state.flowersOffered}/${state.requiredFlowers} offered).`;
                }
                
                const a11yActionBtn = document.getElementById('btn-a11y-action');
                if (a11yActionBtn) {
                    a11yActionBtn.innerText = `Skip/Perform: ${STEPS[state.currentStep].name}`;
                }
            }

            function advanceStep() {
                if (state.currentStep < 8) {
                    state.currentStep++;
                    updateUI();
                    const namaskarZone = document.getElementById('namaskar-zone');
                    if (state.currentStep === 7 && namaskarZone) {
                        namaskarZone.classList.remove('hidden');
                    } else if (state.currentStep === 8) {
                        completePooja();
                    }
                }
            }

            const startPoojaBtn = document.getElementById('btn-start-pooja');
            const audioToggleBtn = document.getElementById('btn-toggle-audio');
            const restartBtn = document.getElementById('btn-restart');
            const restartFinalBtn = document.getElementById('btn-restart-final');
            const welcomeModal = document.getElementById('welcome-modal');
            const completionModal = document.getElementById('completion-modal');

            if (startPoojaBtn && welcomeModal) {
                startPoojaBtn.addEventListener('click', () => {
                    welcomeModal.classList.add('hidden');
                    audioMgr.init();
                    audioMgr.enabled = true;
                    updateUI();
                });
            }

            if (audioToggleBtn) {
                audioToggleBtn.addEventListener('click', (e) => {
                    const active = audioMgr.toggleSound();
                    e.target.innerText = active ? "🔊" : "🔇";
                });
            }

            if (restartBtn) {
                restartBtn.addEventListener('click', () => {
                    resetPoojaState();
                });
            }

            if (restartFinalBtn && completionModal) {
                restartFinalBtn.addEventListener('click', () => {
                    completionModal.classList.add('hidden');
                    resetPoojaState();
                });
            }

            function resetPoojaState() {
                state.currentStep = 0;
                state.flowersOffered = 0;
                state.modaksOffered = 0;
                state.aartiAngleTotal = 0;
                state.lastAartiAngle = null;

                offeredItemsLayer.innerHTML = '';

                const diyaFlame = document.getElementById('diya-flame');
                if (diyaFlame) diyaFlame.classList.add('hidden');
                divineHalo.classList.remove('illuminated');

                const matchstick = document.getElementById('matchstick');
                if (matchstick) matchstick.classList.remove('disabled');

                document.querySelectorAll('.draggable-item').forEach(el => el.classList.remove('disabled'));

                const namaskarZone = document.getElementById('namaskar-zone');
                if (namaskarZone) namaskarZone.classList.add('hidden');

                updateUI();
            }

            const a11yActionBtn = document.getElementById('btn-a11y-action');
            if (a11yActionBtn) {
                a11yActionBtn.addEventListener('click', () => {
                    if (state.currentStep === 0) lightDiya();
                    else if (state.currentStep === 1) {
                        state.flowersOffered = state.requiredFlowers;
                        advanceStep();
                    } else if (state.currentStep === 2) advanceStep();
                    else if (state.currentStep === 3) advanceStep();
                    else if (state.currentStep === 4) lightIncense();
                    else if (state.currentStep === 5) ringBell();
                    else if (state.currentStep === 6) completeAarti();
                    else if (state.currentStep === 7) completeNamaskar();
                });
            }

            function makeDraggable(element, onDropCheck) {
                let startX = 0, startY = 0;

                element.addEventListener('pointerdown', (e) => {
                    e.preventDefault();
                    element.setPointerCapture(e.pointerId);
                    startX = e.clientX;
                    startY = e.clientY;
                    element.style.transition = 'none';
                    element.style.zIndex = 1000;
                });

                element.addEventListener('pointermove', (e) => {
                    if (!element.hasPointerCapture(e.pointerId)) return;
                    const dx = e.clientX - startX;
                    const dy = e.clientY - startY;
                    element.style.transform = `translate(${dx}px, ${dy}px)`;
                });

                element.addEventListener('pointerup', (e) => {
                    if (!element.hasPointerCapture(e.pointerId)) return;
                    element.releasePointerCapture(e.pointerId);
                    
                    const dropSuccess = onDropCheck(e.clientX, e.clientY, element);

                    if (!dropSuccess) {
                        element.style.transition = 'transform 0.3s ease';
                        element.style.transform = 'translate(0px, 0px)';
                    }
                });
            }

            // Step 1: Diya Lighting
            const matchstick = document.getElementById('matchstick');
            const diyaWick = document.getElementById('diya-wick');

            makeDraggable(matchstick, (x, y) => {
                if (state.currentStep !== 0) return false;
                const wickRect = diyaWick.getBoundingClientRect();
                const dist = Math.hypot(x - (wickRect.left + wickRect.width/2), y - (wickRect.top + wickRect.height/2));

                if (dist < 40) {
                    lightDiya();
                    return true;
                }
                return false;
            });

            function lightDiya() {
                const diyaFlame = document.getElementById('diya-flame');
                if (diyaFlame) diyaFlame.classList.remove('hidden');
                divineHalo.classList.add('illuminated');
                if (matchstick) matchstick.classList.add('disabled');
                audioMgr.playDiya();
                advanceStep();
            }

            // Steps 2, 3, 4: Drag & Drop Offerings
            const draggables = document.querySelectorAll('.draggable-item');
            draggables.forEach(item => {
                const type = item.dataset.type;
                if (!type) return;

                makeDraggable(item, (x, y, el) => {
                    const targetRect = dropZone.getBoundingClientRect();
                    const inside = (
                        x >= targetRect.left && x <= targetRect.right &&
                        y >= targetRect.top && y <= targetRect.bottom
                    );

                    if (inside) {
                        if (type === 'flower' && state.currentStep === 1) {
                            offerFlower(el, x, y);
                            return true;
                        } else if (type === 'durva' && state.currentStep === 2) {
                            offerDurva(el, x, y);
                            return true;
                        } else if (type === 'modak' && state.currentStep === 3) {
                            offerModak(el, x, y);
                            return true;
                        }
                    }
                    return false;
                });
            });

            function spawnLandedItem(symbol, x, y) {
                const containerRect = ganeshaContainer.getBoundingClientRect();
                const relX = x - containerRect.left;
                const relY = y - containerRect.top;

                const landed = document.createElement('div');
                landed.className = 'landed-offering';
                landed.innerText = symbol;
                landed.style.left = `${relX}px`;
                landed.style.top = `${relY}px`;
                offeredItemsLayer.appendChild(landed);
            }

            function offerFlower(el, x, y) {
                el.classList.add('disabled');
                spawnLandedItem(el.innerText, x, y);
                audioMgr.playOffering();
                state.flowersOffered++;
                if (state.flowersOffered >= state.requiredFlowers) {
                    advanceStep();
                } else {
                    updateUI();
                }
            }

            function offerDurva(el, x, y) {
                el.classList.add('disabled');
                spawnLandedItem(el.innerText, x, y);
                audioMgr.playOffering();
                advanceStep();
            }

            function offerModak(el, x, y) {
                el.classList.add('disabled');
                spawnLandedItem(el.innerText, x, y);
                audioMgr.playOffering();
                state.modaksOffered++;
                if (state.modaksOffered >= state.requiredModaks) {
                    advanceStep();
                }
            }

            // Step 5: Dhoop / Incense
            const incenseStick = document.getElementById('incense-stick');
            const incenseHolder = document.getElementById('incense-holder');

            makeDraggable(incenseStick, (x, y) => {
                if (state.currentStep !== 4) return false;
                const rect = incenseHolder.getBoundingClientRect();
                if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                    lightIncense();
                    return true;
                }
                return false;
            });

            function lightIncense() {
                incenseStick.classList.add('disabled');
                const smokeContainer = document.getElementById('smoke-container');
                setInterval(() => {
                    const puff = document.createElement('div');
                    puff.className = 'smoke-puff';
                    smokeContainer.appendChild(puff);
                    setTimeout(() => puff.remove(), 2000);
                }, 400);
                audioMgr.playDiya();
                advanceStep();
            }

            // Step 6: Temple Bell
            const bell = document.getElementById('hanging-bell');
            bell.addEventListener('click', ringBell);

            function ringBell() {
                if (state.currentStep !== 5) return;
                bell.classList.add('bell-ring-anim');
                audioMgr.playBell();
                setTimeout(() => {
                    bell.classList.remove('bell-ring-anim');
                    advanceStep();
                }, 1200);
            }

            // Step 7: Aarti Circular Motion
            const aartiPlate = document.getElementById('aarti-plate');
            const aartiFlame = document.getElementById('aarti-flame');
            let trackingAarti = false;

            aartiPlate.addEventListener('pointerdown', (e) => {
                if (state.currentStep !== 6) return;
                trackingAarti = true;
                aartiPlate.setPointerCapture(e.pointerId);
                aartiFlame.classList.remove('hidden');
                state.lastAartiAngle = null;
            });

            aartiPlate.addEventListener('pointermove', (e) => {
                if (!trackingAarti || state.currentStep !== 6) return;

                const gRect = ganeshaContainer.getBoundingClientRect();
                const gCenterX = gRect.left + gRect.width / 2;
                const gCenterY = gRect.top + gRect.height / 2;

                aartiPlate.style.transform = `translate(${e.clientX - gCenterX}px, ${e.clientY - gCenterY + 100}px)`;

                const rad = Math.atan2(e.clientY - gCenterY, e.clientX - gCenterX);
                const deg = rad * (180 / Math.PI);

                if (state.lastAartiAngle !== null) {
                    let delta = deg - state.lastAartiAngle;
                    if (delta > 180) delta -= 360;
                    if (delta < -180) delta += 360;
                    state.aartiAngleTotal += Math.abs(delta);

                    if (state.aartiAngleTotal >= 1080) {
                        trackingAarti = false;
                        completeAarti();
                    }
                }
                state.lastAartiAngle = deg;
            });

            aartiPlate.addEventListener('pointerup', (e) => {
                if (!trackingAarti) return;
                trackingAarti = false;
                aartiPlate.style.transform = 'translate(0px, 0px)';
            });

            function completeAarti() {
                aartiFlame.classList.add('hidden');
                aartiPlate.style.transform = 'translate(0px, 0px)';
                audioMgr.playOffering();
                advanceStep();
            }

            // Step 8: Namaskar
            const btnNamaskar = document.getElementById('btn-namaskar');
            const progressCircle = document.querySelector('.progress-ring__circle');
            let holdTimer = null;
            let holdProgress = 0;

            function startHold(e) {
                if (state.currentStep !== 7 || !progressCircle) return;
                e.preventDefault();
                holdProgress = 0;
                holdTimer = setInterval(() => {
                    holdProgress += 5;
                    const offset = 326.72 - (holdProgress / 100) * 326.72;
                    progressCircle.style.strokeDashoffset = offset;

                    if (holdProgress >= 100) {
                        clearInterval(holdTimer);
                        completeNamaskar();
                    }
                }, 100);
            }

            function endHold() {
                if (holdTimer) clearInterval(holdTimer);
                holdProgress = 0;
                if (progressCircle) progressCircle.style.strokeDashoffset = 326.72;
            }

            if (btnNamaskar) {
                btnNamaskar.addEventListener('pointerdown', startHold);
                btnNamaskar.addEventListener('pointerup', endHold);
                btnNamaskar.addEventListener('pointerleave', endHold);
            }

            function completeNamaskar() {
                const namaskarZone = document.getElementById('namaskar-zone');
                if (namaskarZone) namaskarZone.classList.add('hidden');
                advanceStep();
            }

            // Final Completion
            function completePooja() {
                state.poojaCount++;
                localStorage.setItem('g3d_pooja_count', state.poojaCount.toString());

                const summary = document.getElementById('pooja-summary');
                if (summary) {
                    summary.innerHTML = `
                        <p>🌸 Flowers Offered: ${state.flowersOffered}</p>
                        <p>🥟 Modaks Offered: ${state.modaksOffered}</p>
                        <p>🪔 Aarti Rotations: 3</p>
                        <p> Total Completed Poojas: ${state.poojaCount}</p>
                    `;
                }

                const completionModal = document.getElementById('completion-modal');
                if (completionModal) completionModal.classList.remove('hidden');
            }
        });

        
