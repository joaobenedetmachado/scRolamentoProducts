let produtos = [];

// Função para buscar produtos da API
async function buscarProdutos() {
    try {
        const response = await fetch('https://sc-rolamento-products-api.vercel.app/documentos/');
        const data = await response.json();
        
        // Verifica se o array de documentos está presente e é um array
        if (data && data.documentos && Array.isArray(data.documentos)) {
            produtos = data.documentos; // Armazena os produtos no array
            renderizarProdutos(); // Chama a função para renderizar os produtos na tela
        } else {
            console.error('Nenhum produto encontrado ou estrutura de produtos inválida:', data);
        }
    } catch (error) {
        console.error('Erro ao buscar produtos da API:', error);
    }
}

// Função para renderizar os produtos na coluna da esquerda
function renderizarProdutos() {
    const productCardsContainer = document.getElementById('product-cards');
    productCardsContainer.innerHTML = ''; // Limpa o container antes de renderizar novos produtos

    // Itera sobre os produtos e cria um card para cada um
    produtos.forEach(produto => {
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.innerHTML = `
            <h3>Produto: 
                <input type="text" value="${produto.nome}" class="product-name" data-id="${produto._id}">
            </h3>
            <p>Peso: 
                <input type="number" value="${produto.peso}" class="product-weight" data-id="${produto._id}" step="0.01"> kg
            </p>
            <p>Preço: 
                <input type="number" value="${produto.preco}" class="product-price" data-id="${produto._id}" step="0.01"> R$
            </p>
            <button class="update-btn" data-id="${produto._id}">Atualizar</button>
        `;
        productCardsContainer.appendChild(card); // Adiciona o card ao container
    });

    // Adiciona eventos de clique para os botões de atualizar
    const updateButtons = document.querySelectorAll('.update-btn');
    updateButtons.forEach(button => {
        button.addEventListener('click', atualizarProduto);
    });
}

// Função para atualizar o produto na API
async function atualizarProduto(event) {
    const id = event.target.dataset.id; // Obtém o ID do produto
    const productName = event.target.parentElement.querySelector('.product-name').value;
    const productWeight = parseFloat(event.target.parentElement.querySelector('.product-weight').value);
    const productPrice = parseFloat(event.target.parentElement.querySelector('.product-price').value);

    const produtoAtualizado = {
        nome: productName,
        peso: productWeight,
        preco: productPrice,
    };

    try {
        const response = await fetch(`https://sc-rolamento-products-api.vercel.app/documentos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(produtoAtualizado),
        });

        if (!response.ok) {
            throw new Error('Erro ao atualizar o produto');
        }

        // Atualiza o produto localmente
        const produtoIndex = produtos.findIndex(prod => prod._id === id);
        if (produtoIndex !== -1) {
            produtos[produtoIndex] = { ...produtos[produtoIndex], ...produtoAtualizado };
            alert('Produto atualizado com sucesso!');
        }

    } catch (error) {
        console.error('Erro ao atualizar o produto:', error);
        alert('Erro ao atualizar o produto. Tente novamente.');
    }
}

// Função para calcular o peso e o preço total com base na quantidade
function calcularTotal() {
    const productNameInput = document.getElementById('product-name').value;
    const productQuantityInput = document.getElementById('product-quantity').value;

    // Filtra o produto que corresponde ao nome inserido
    const produto = produtos.find(p => p.nome.toLowerCase() === productNameInput.toLowerCase());

    if (produto && productQuantityInput > 0) {
        const quantidade = parseInt(productQuantityInput);
        const pesoTotal = produto.peso * quantidade; // Calcula o peso total
        const precoTotal = produto.preco * quantidade; // Calcula o preço total

        // Atualiza os resultados na tela
        document.getElementById('total-weight').textContent = pesoTotal.toFixed(2);
        document.getElementById('total-price').textContent = precoTotal.toFixed(2);
    } else {
        // Reseta os resultados caso o produto não seja encontrado
        document.getElementById('total-weight').textContent = '0.00';
        document.getElementById('total-price').textContent = '0.00';
    }
}

// Adiciona evento ao botão de calcular
document.getElementById('calculate-btn').addEventListener('click', calcularTotal);

// Chama a função para buscar produtos quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', buscarProdutos);
