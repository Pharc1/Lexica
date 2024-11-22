// Initialisation de la scène, de la caméra et du rendu
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10);
camera.position.set(0, 0, 5);


const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Création des points dispersés de manière aléatoire
const pointCount = 150; // Nombre de points (plus élevé pour plus de densité)
const radius = 2; // Rayon de dispersion des points
const pointGeometry = new THREE.BufferGeometry();
const positions = [];

for (let i = 0; i < pointCount; i++) {
    // Position aléatoire des points dans une sphère
    const theta = Math.random() * Math.PI * 2; // Angle autour de l'axe Y
    const phi = Math.random() * Math.PI - Math.PI / 2; // Angle autour de l'axe X
    const x = radius * Math.cos(phi) * Math.sin(theta);
    const y = radius * Math.sin(phi);
    const z = radius * Math.cos(phi) * Math.cos(theta);
    
    positions.push(x, y, z);
}

const positionAttribute = new THREE.Float32BufferAttribute(positions, 3);
pointGeometry.setAttribute('position', positionAttribute);

// Matériau des points avec effet de brillance et opacité variable
const pointMaterial = new THREE.PointsMaterial({
    color: 0x9b59b6,
    size: 0.01, // Taille des points
    transparent: true,
    opacity: 0.6, // Opacité subtile
    sizeAttenuation: true // Taille des points qui varie en fonction de la distance
});

const points = new THREE.Points(pointGeometry, pointMaterial);
scene.add(points);

// Animation subtile avec mouvements de type "galaxie"
function animate() {
    const time = Date.now() * 0.001;
    const positions = pointGeometry.attributes.position.array;

    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];

        // Appliquer un léger mouvement aléatoire aux points
        positions[i] += Math.sin(y * 2 + time) * 0.001;
        positions[i + 1] += Math.cos(x * 2 + time) * 0.001;
    }

    pointGeometry.attributes.position.needsUpdate = true;

    // Appliquer une rotation douce sur la scène pour un effet de galaxie
    scene.rotation.y += 0.0005; // Rotation plus lente pour un effet plus subtil
    
    // Mettre à jour la caméra pour un mouvement plus fluide
    camera.position.x = Math.sin(time * 0.1) * 2; // Mouvement léger de la caméra
    camera.position.y = Math.cos(time * 0.1) * 2;
    camera.lookAt(scene.position); // Assurer que la caméra regarde toujours le centre de la scène

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// Gestion du redimensionnement
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


document.querySelectorAll('.clickable').forEach(item => {
    item.addEventListener('click', function() {
        // Remplir le champ input avec le texte de l'élément cliqué
        document.getElementById('question').value = this.textContent;
        

        document.querySelector('.send-button').click();
    });
});


const responseTextElement = document.getElementById('responseText');
const questionInput = document.getElementById('question');

document.getElementById("questionForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    responseTextElement.innerHTML = ''; // Clear previous response

    const answerSection = document.getElementById("answerSection");
    answerSection.style.display = 'block'; // Assure que la réponse est visible

    gsap.fromTo(answerSection, {
        opacity: 0,
        y: 20
    }, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.inOut"
    });

    const decoder = new TextDecoder("utf-8");
    let output = "";

    // Commencer à pulser en rouge
    pulseColor(0xff0000);

    try {
        const response = await fetch(`/ask?question=${encodeURIComponent(questionInput.value)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: questionInput.value }),
            cache: "no-cache" // Ensure no caching issues
        });

        if (!response.ok) {
            throw new Error("Erreur de réseau : " + response.statusText);
        }

        const reader = response.body.getReader();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            output += decoder.decode(value);
            responseTextElement.innerHTML = marked.parse(output);
            console.log('Contenu mis à jour :', responseTextElement.innerHTML);
        }

    } catch (error) {
        console.error("Erreur lors de la requête : ", error);
        responseTextElement.innerHTML = "Erreur lors du traitement de la requête.";
    } finally {
        // Arrêter de pulser et revenir à la couleur d'origine
        stopPulsing();
    }

    // Animer les éléments à cacher
    gsap.to(".meet-gpt-text", {
        opacity: 0,
        height: 0,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: function () {
            document.querySelector('.meet-gpt-text').style.display = 'none';
        }
    });

    gsap.to(".suggestions-title", {
        opacity: 0,
        height: 0,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: function () {
            document.querySelector('.suggestions-title').style.display = 'none';
        }
    });

    gsap.to(".example-questions", {
        opacity: 0,
        height: 0,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: function () {
            document.querySelector('.example-questions').style.display = 'none';
        }
    });

    gsap.to("#questionForm", {
        y: -100,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 0.4,
        ease: "power2.inOut"
    });
});

// Fonction pour pulser la couleur
function pulseColor() {
    gsap.to(points.material.color, {
        r: 0.84, // Lavande
        g: 0.78,
        b: 0.88,
        duration: 0.9,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
    });
}

// Fonction pour arrêter de pulser
function stopPulsing() {
    gsap.killTweensOf(points.material.color); // Arrête toutes les animations sur la couleur
    points.material.color.set(0x9b59b6); // Remet la couleur d'origine
}

async function uploadFile() {
    const fileInput = document.getElementById('file-upload');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const message = document.getElementById('messageDone');

    if (fileInput.files.length === 0) return;
    pulseColor(0xff0000);

    // Afficher l'overlay de chargement
    loadingOverlay.classList.remove('hidden');

    gsap.to(".example-questions", {
        opacity: 0,
        height: 0,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: function () {
            document.querySelector('.example-questions').style.display = 'none';
        }
    });
    gsap.to(".suggestions-title", {
        opacity: 0,
        height: 0,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: function () {
            document.querySelector('.suggestions-title').style.display = 'none';
        }
    });

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    // Exécuter la requête POST immédiatement
    try {
        const response = await fetch('/file', {
            method: "POST",
            body: formData,
            cache: "no-cache" // Assurer qu'il n'y ait pas de problèmes de cache
        });

        if (!response.ok) {
            throw new Error("Erreur de réseau : " + response.statusText);
        }

        const reader = response.body.getReader();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
        }

        // Afficher le message de confirmation
        stopPulsing();
        message.classList.remove('hidden');
        message.style.display = 'block';
        const book = document.querySelector('.book');
        book.classList.add('hidden');

        // Masquer l'overlay et le message après 2 secondes
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
            message.classList.add('hidden');
            message.style.display = 'none';  // Cacher le message
        }, 4000);

    } catch (error) {
        console.error("Erreur lors de la requête : ", error);
        message.innerHTML = "Erreur lors du traitement de la requête.";
    } finally {
        stopPulsing();
        loadingOverlay.classList.add('hidden');
        message.classList.add('hidden');
    }
}


// JavaScript pour démarrer l'animation quand le fichier est chargé
window.addEventListener("load", function() {
    const book = document.querySelector('.book');
    book.classList.remove('paused'); // Enlève la classe `paused` pour démarrer l'animation
});