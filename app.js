const API_URL = 'https://pokeapi.co/api/v2/pokemon/';
const TOTAL_POKEMON = 151;

let player1Deck = [];
let player2Deck = [];
let selectedCards = { p1: null, p2: null };
let startingPlayer = 1;
let currentTurn = startingPlayer;
let gameMode = 'multiplayer';

document.getElementById('gameMode').addEventListener('change', function () {
    gameMode = this.value;
});


const status = document.getElementById('status');
const startBtn = document.getElementById('startBtn');

const p1Title = document.getElementById('p1Title');
const p2Title = document.getElementById('p2Title');

p1Title.style.display = player1Deck.length === 0 ? 'none' : '';
p2Title.style.display = player2Deck.length === 0 ? 'none' : '';

startBtn.addEventListener('click', dealCards);

async function getPokemonById(id) {
    const res = await fetch(API_URL + id);
    const data = await res.json();
    return {
        id: data.id,
        name: data.name,
        image: data.sprites.other["official-artwork"].front_shiny,
        height: data.height,
        weight: data.weight,
        attack: data.stats[1].base_stat,
        defense: data.stats[2].base_stat,
        type: data.types[0].type.name,
        speed: data.stats[5].base_stat,
        hp: data.stats[0].base_stat,

    };
}

async function getUniquePokemon(num) {
    const ids = new Set();
    while (ids.size < num) {
        ids.add(Math.floor(Math.random() * TOTAL_POKEMON) + 1);
    }
    const promises = Array.from(ids).map(getPokemonById);
    return Promise.all(promises);
}

function flipCard() {
    this.classList.toggle("flip");
}

async function dealCards() {
    startBtn.textContent = 'RE-DEAL';
    p1Title.style.display = '';
    p2Title.style.display = '';

    tiltEffect();
    const pokemons = await getUniquePokemon(10);
    player1Deck = pokemons.slice(0, 5);
    player2Deck = pokemons.slice(5, 10);
    selectedCards = { p1: null, p2: null };
    selectedIndexes = { p1: null, p2: null };
    currentTurn = startingPlayer;
    status.textContent = `PLAYER ${currentTurn}: choose a card`;
    renderDecks();
    indicateTurn();

    if (gameMode === 'cpu' && startingPlayer === 2) {
        setTimeout(cpuSelectCard, 800);
    }
}

function alternateStartingPlayer() {
    startingPlayer = startingPlayer === 1 ? 2 : 1;
}

function indicateTurn() {
    if (currentTurn === 1) {
        const player1 = document.getElementById('p1Title');
        player1.classList.add('turn-indicator');
        const player2 = document.getElementById('p2Title');
        player2.classList.remove('turn-indicator');
    } else {
        const player2 = document.getElementById('p2Title');
        player2.classList.add('turn-indicator');
        const player1 = document.getElementById('p1Title');
        player1.classList.remove('turn-indicator');
    }
}

function createCard(poke, index, player, isCurrentTurn, isSelected) {
    const card = document.createElement('div');
    card.classList.add('card');
    const cardInner = document.createElement('div');
    cardInner.classList.add('card-inner');


    card.setAttribute('data-player', player);
    card.setAttribute('data-index', index);
    if (isSelected) card.classList.add('selected');

    // Cara frontal
    const cardFront = document.createElement('div');
    cardFront.classList.add('card-front', `bg-${poke.type}`);

    // Imagen y borde
    const imageBorder = document.createElement("div");
    imageBorder.className = "image-border";
    const pokemonImage = document.createElement("img");
    pokemonImage.setAttribute("src", poke.image);
    pokemonImage.setAttribute("alt", poke.name);
    pokemonImage.className = "card-image";
    imageBorder.appendChild(pokemonImage);

    // ID centrado detrás de la imagen
    const pokemonId = document.createElement("p");
    pokemonId.textContent = poke.id.toString().padStart(3, "0");
    pokemonId.className = poke.type + "-dark pokemon-id";
    imageBorder.appendChild(pokemonId);

    cardFront.appendChild(imageBorder);

    // Nombre
    const pokemonName = document.createElement("h2");
    pokemonName.textContent = poke.name;
    pokemonName.className = "card-title";
    cardFront.appendChild(pokemonName);

    // Tamaño
    const pokemonSize = document.createElement("div");
    pokemonSize.className = "size-block";
    const pokemonHeight = document.createElement("p");
    pokemonHeight.textContent = "Height: " + poke.height + "0cm";
    pokemonHeight.className = "data";
    pokemonSize.appendChild(pokemonHeight);
    const pokemonWeight = document.createElement("p");
    pokemonWeight.textContent = "Weight: " + poke.weight + "kg";
    pokemonWeight.className = "data";
    pokemonSize.appendChild(pokemonWeight);
    cardFront.appendChild(pokemonSize);

    // Stats
    const pokemonData = document.createElement("div");
    pokemonData.className = "data-block";

    // HP
    const hp = document.createElement("div");
    hp.className = "progress-block";
    const pokemonHp = document.createElement("p");
    pokemonHp.textContent = "HP | " + poke.hp;
    pokemonHp.className = "data stat-label";
    const progressHp = document.createElement("progress");
    progressHp.className = "progressHp hp-color";
    progressHp.value = poke.hp;
    progressHp.max = 300;
    hp.appendChild(pokemonHp);
    hp.appendChild(progressHp);
    pokemonData.appendChild(hp);

    // ATK
    const attack = document.createElement("div");
    attack.className = "progress-block";
    const pokemonAttack = document.createElement("p");
    pokemonAttack.textContent = "ATK | " + poke.attack;
    pokemonAttack.className = "data stat-label";
    const progressAttack = document.createElement("progress");
    progressAttack.className = "progressAttack atk-color";
    progressAttack.value = poke.attack;
    progressAttack.max = 300;
    attack.appendChild(pokemonAttack);
    attack.appendChild(progressAttack);
    pokemonData.appendChild(attack);

    // DEF
    const defense = document.createElement("div");
    defense.className = "progress-block";
    const pokemonDefense = document.createElement("p");
    pokemonDefense.textContent = "DEF | " + poke.defense;
    pokemonDefense.className = "data stat-label";
    const progressDefense = document.createElement("progress");
    progressDefense.className = "progressDefense def-color";
    progressDefense.value = poke.defense;
    progressDefense.max = 300;
    defense.appendChild(pokemonDefense);
    defense.appendChild(progressDefense);
    pokemonData.appendChild(defense);

    cardFront.appendChild(pokemonData);

    // Cara trasera
    const cardBack = document.createElement('div');
    cardBack.classList.add('card-back');

    // Click handler
    if (isCurrentTurn) {
        card.addEventListener('click', function () {
            this.classList.toggle('flip');      // Hace el flip visual
            selectCard(player, index);          // Tu lógica de selección
        });
    } else {
        card.style.cursor = 'not-allowed';
    }

    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    card.appendChild(cardInner);

    return card;
}

function renderDecks() {



    indicateTurn();

    const p1 = document.getElementById('player1');
    const p2 = document.getElementById('player2');
    p1.innerHTML = '';
    p2.innerHTML = '';

    player1Deck.forEach((poke, index) => {
        const card = createCard(
            poke,
            index,
            'p1',
            currentTurn === 1,
            selectedIndexes.p1 === index
        );
        p1.appendChild(card);
    });

    player2Deck.forEach((poke, index) => {
        const card = createCard(
            poke,
            index,
            'p2',
            currentTurn === 2,
            selectedIndexes.p2 === index
        );
        p2.appendChild(card);
    });

    setTimeout(() => {
        document.querySelectorAll('.card[data-player="p1"] .card-inner').forEach(cardInner => {
            if (currentTurn !== 1) cardInner.classList.add('flip');
            else cardInner.classList.remove('flip');
        });
        document.querySelectorAll('.card[data-player="p2"] .card-inner').forEach(cardInner => {
            if (currentTurn !== 2) cardInner.classList.add('flip');
            else cardInner.classList.remove('flip');
        });
    }, 10);

    if (gameMode === 'cpu' && startingPlayer === 2) {
        setTimeout(cpuSelectCard, 800);

    }

    tiltEffect();
}

function selectCard(player, index) {

    selectedIndexes[player] = index;

    // Quitar selección previa
    document.querySelectorAll(`.card[data-player="${player}"]`).forEach(card => {
        card.classList.remove('selected');
    });

    // Añadir selección a la carta actual
    const selectedCard = document.querySelector(`.card[data-player="${player}"][data-index="${index}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }

    if (player === 'p1') {
        selectedCards.p1 = player1Deck[index];
        if (startingPlayer === 1) {
            currentTurn = 2;
            status.textContent = `PLAYER ${currentTurn}: choose a card`;
            if (gameMode === 'cpu') {
                setTimeout(cpuSelectCard, 800); // Espera para que se vea el turno
            } else {
                renderDecks();
            }
        } else {
            // Si el jugador 1 no empezó, ya eligió después del jugador 2, así que resolvemos
            resolveBattle();
        }
    } else if (player === 'p2') {
        selectedCards.p2 = player2Deck[index];
        if (startingPlayer === 2) {
            currentTurn = 1;
            status.textContent = `PLAYER ${currentTurn}: choose a card`;
            renderDecks();
        } else {
            // Si el jugador 2 no empezó, ya eligió después del jugador 1, así que resolvemos
            resolveBattle();
        }
    }




}

function animateSelectedCardsAndShowPopup(result, onClose) {
    // Selecciona las cartas elegidas
    const p1Card = document.querySelector('.card[data-player="p1"].selected');
    const p2Card = document.querySelector('.card[data-player="p2"].selected');

    // Crea un contenedor para las cartas animadas
    let arena = document.createElement('div');
    arena.className = 'battle-arena';

    // Clona las cartas seleccionadas para animarlas (así no desaparecen del tablero)
    const p1Clone = p1Card ? p1Card.cloneNode(true) : null;
    const p2Clone = p2Card ? p2Card.cloneNode(true) : null;

    if (p1Clone) {
        p1Clone.classList.add('selected-battle');
        p1Clone.firstChild.classList.remove('flip');
        // Quita la selección de la carta original
        arena.appendChild(p1Clone);
    }
    if (p2Clone) {
        p2Clone.classList.add('selected-battle');
        p2Clone.firstChild.classList.remove('flip');
        arena.appendChild(p2Clone);
    }

    document.body.appendChild(arena);

    setTimeout(() => {
        p1Clone.querySelector('.card-inner').classList.add('flip-twice');
        p2Clone.querySelector('.card-inner').classList.add('flip-twice');
    }, 100);

    // Muestra el popup debajo de las cartas
    const popup = document.getElementById('popup');
    document.getElementById('popup-message').textContent = result;
    popup.style.display = 'flex';

    // Al cerrar el popup, limpia animación y ejecuta la lógica de siguiente ronda
    document.getElementById('popup-close').onclick = function () {
        arena.remove();
        popup.style.display = 'none';
        if (typeof onClose === 'function') onClose();
    };
}

function resolveBattle() {
    const { p1, p2 } = selectedCards;
    let result = '';

    let attacker, defender, attackerDeck, defenderDeck, attackerName, defenderName, attackerCard, defenderCard;

    if (startingPlayer === 1) {
        attacker = p1;
        defender = p2;
        attackerDeck = player1Deck;
        defenderDeck = player2Deck;
        attackerName = "PLAYER 1";
        defenderName = "PLAYER 2";
        attackerCard = 'p1';
        defenderCard = 'p2';
    } else {
        attacker = p2;
        defender = p1;
        attackerDeck = player2Deck;
        defenderDeck = player1Deck;
        attackerName = "PLAYER 2";
        defenderName = "PLAYER 1";
        attackerCard = 'p2';
        defenderCard = 'p1';
    }

    if (attacker.attack >= defender.defense) {
        attackerDeck.push(defender);
        defenderDeck.splice(defenderDeck.indexOf(defender), 1);
        result = `${attackerName} wins round: ${attacker.name} beats ${defender.name}`;
    } else if (defender.attack > attacker.defense) {
        defenderDeck.push(attacker);
        attackerDeck.splice(attackerDeck.indexOf(attacker), 1);
        result = `${defenderName} wins round: ${defender.name} beats ${attacker.name}`;
    } if (attacker.attack === defender.defense) {

        attackerDeck.splice(attackerDeck.indexOf(attacker), 1);
        defenderDeck.splice(defenderDeck.indexOf(defender), 1);
        result = `IT'S A DRAW: both players lose their cards: ${attacker.name} vs ${defender.name}`;
    }

    animateSelectedCardsAndShowPopup(result, () => {
        // Aquí tu lógica para continuar la partida
        selectedIndexes = { p1: null, p2: null };
        selectedCards = { p1: null, p2: null };
        alternateStartingPlayer();
        renderDecks();
        checkGameOver();
    });
}

function checkGameOver() {
    if (player1Deck.length === 0 || player2Deck.length === 0) {
        const winner = player1Deck.length > player2Deck.length ? "PLAYER 1" : "PLAYER 2";
        status.textContent = `GAME OVER. Winner: ${winner}`;
        let result = `GAME OVER. Winner: ${winner}`;
        showPopup(result);
    }
}

function showPopup(message) {
    document.getElementById('popup-message').textContent = message;
    document.getElementById('popup').style.display = 'flex';
}

function hidePopup() {
    document.getElementById('popup').style.display = 'none';
    document.querySelectorAll('.card.selected').forEach(card => {
        card.classList.remove('selected');
    });
    selectedIndexes = { p1: null, p2: null };
    selectedCards = { p1: null, p2: null };

}

document.getElementById('popup-close').onclick = hidePopup;
document.getElementById('popup').onclick = function (e) {
    if (e.target === this) hidePopup();
};

function tiltEffect() {
    VanillaTilt.init(document.querySelectorAll(".card"), {
        max: 25,
        speed: 400,
        glare: true,
    });
};

function cpuSelectCard() {
    // Elige un índice aleatorio de las cartas disponibles del jugador 2
    if (player2Deck.length === 0) return;
    if (selectedCards.p2) return; 
    const availableIndexes = player2Deck.map((_, idx) => idx);
    const randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
    selectCard('p2', randomIndex);
}
