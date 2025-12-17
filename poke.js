// ----------------------------------------------------------------------
// 1. ฟังก์ชันหลักสำหรับเรียก API (จากคำถามต้นฉบับ)
// ----------------------------------------------------------------------
async function getPokemon(nameOrId) {
    const url = `https://pokeapi.co/api/v2/pokemon/${nameOrId}`;

    try {
        const response = await fetch(url);

        if (response.status === 404) {
            throw new Error('Pokemon not found! (ไม่พบ Pokemon)');
        }

        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const pokemon = await response.json();

        // Extract ข้อมูลที่ต้องการ
        return {
            name: pokemon.name,
            id: pokemon.id,
            height: pokemon.height,
            weight: pokemon.weight,
            types: pokemon.types.map(t => t.type.name),
            image: pokemon.sprites.front_default,
            base_experience: pokemon.base_experience,
            stats: pokemon.stats.map(s => ({
                name: s.stat.name,
                value: s.base_stat
            }))
        };

    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

// ----------------------------------------------------------------------
// 2. ฟังก์ชันแสดงผลและจัดการ DOM
// ----------------------------------------------------------------------

/**
 * แสดงข้อความสถานะในกล่อง Output
 * @param {string} elementId ID ของกล่อง output (เช่น 'fetch-output-3')
 * @param {string} message ข้อความที่จะแสดง
 * @param {boolean} isError ระบุว่าเป็นข้อความผิดพลาดหรือไม่
 */
function setOutputMessage(elementId, message, isError = false) {
    const outputBox = document.getElementById(elementId);
    outputBox.innerHTML = `<p style="color: ${isError ? 'red' : '#007bff'};">${message}</p>`;

    // ล้างการ์ดเดิมเมื่อเกิด Error หรือเริ่มค้นหาใหม่
    if (isError || elementId === 'fetch-output-3') {
        document.getElementById('pokemon-display').innerHTML = '';
    }
}

/**
 * สร้างและแสดงการ์ด Pokemon
 * @param {object} data ข้อมูล Pokemon ที่ถูกจัดรูปแบบแล้ว
 */
function displayPokemonCard(data) {
    const displayArea = document.getElementById('pokemon-display');

    // สร้างรายการ Stats
    const statsList = data.stats.map(stat =>
        // แปลงชื่อ stat ให้ดูดีขึ้น
        `<li><strong>${stat.name.replace('-', ' ').toUpperCase()}:</strong> ${stat.value}</li>`
    ).join('');

    // สร้างรายการ Types เป็น Badge
    const typeBadges = data.types.map(t =>
        `<span class="type-badge">${t.toUpperCase()}</span>`
    ).join(' ');

    const cardHTML = `
        <div class="pokemon-card">
            <div class="pokemon-image">
                <img src="${data.image}" alt="${data.name}"/>
            </div>
            <h3>#${data.id} ${data.name.toUpperCase()}</h3>
            <p><strong>Types:</strong> ${typeBadges}</p>
            <div class="pokemon-details">
                <p><strong>Height:</strong> ${data.height / 10} m</p>
                <p><strong>Weight:</strong> ${data.weight / 10} kg</p>
                <p><strong>base_experience:</strong> ${data.base_experience}</p>
            </div>
            <div class="pokemon-stats">
                <h4>Base Stats</h4>
                <ul>
                    ${statsList}
                </ul>
            </div>
        </div>
    `;

    displayArea.innerHTML = cardHTML;
}


// ----------------------------------------------------------------------
// 3. ฟังก์ชันที่ถูกเรียกเมื่อผู้ใช้กดปุ่ม (ต้องอยู่ใน Global Scope)
// ----------------------------------------------------------------------
async function runPokemonDemo() {
    const inputElement = document.getElementById('pokemon-search');
    const searchId = inputElement.value.trim().toLowerCase();

    if (!searchId) {
        setOutputMessage('fetch-output-3', 'กรุณากรอก ชื่อ หรือ ID ของ Pokemon', true);
        return;
    }

    setOutputMessage('fetch-output-3', `กำลังค้นหา Pokemon: **${searchId}**...`);

    try {
        const pokemonData = await getPokemon(searchId);

        // แสดงผลเมื่อสำเร็จ
        setOutputMessage('fetch-output-3', `✅ ค้นพบ Pokemon: **${pokemonData.name.toUpperCase()}**!`);

        // แสดงข้อมูลในรูปแบบการ์ด
        displayPokemonCard(pokemonData);

    } catch (error) {
        // แสดงข้อความผิดพลาดที่ถูก throw มาจาก getPokemon()
        setOutputMessage('fetch-output-3', `❌ เกิดข้อผิดพลาด: ${error.message}`, true);
    }
}