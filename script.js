// Função para formatar CPF
function formatarCPF(cpf) {
    cpf = cpf.replace(/\D/g, ''); // Remove tudo que não é número
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2'); // Coloca ponto após os primeiros 3 dígitos
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2'); // Coloca ponto após os segundos 3 dígitos
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Coloca hífen antes dos últimos 2 dígitos
    return cpf;
}

document.addEventListener('DOMContentLoaded', function() {
    // Carrinho de compras - Inicializar com dados do localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const cartModal = document.getElementById('cart-modal');
    const cartItems = document.querySelector('.cart-items');
    const cartCount = document.querySelector('.cart-count');
    const cartTotalValue = document.getElementById('cart-total-value');
    const btnCart = document.querySelector('.btn-cart');
    const btnFinalizarCompra = document.getElementById('btn-finalizar-compra');
    const btnLimparCarrinho = document.getElementById('btn-limpar-carrinho');
    const modal = document.getElementById('modal');
    const pixRadio = document.getElementById('pix');
    const pixInfo = document.getElementById('pix-info');
    let qrcode = null;

    // Inicializar o estado do carrinho
    updateCartCount();
    updateCartTotal();
    renderCartItems();

    // Função para salvar carrinho no localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        updateCartTotal();
    }

    // Função para atualizar o contador do carrinho
    function updateCartCount() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    // Função para atualizar o total do carrinho
    function updateCartTotal() {
        const total = cart.reduce((sum, item) => sum + (item.valor * item.quantity), 0);
        cartTotalValue.textContent = total.toFixed(2).replace('.', ',');
    }

    // Função para limpar o carrinho
    function clearCart() {
        cart = [];
        saveCart();
        renderCartItems();
        cartModal.style.display = 'none';
    }

    // Event listener para o botão de limpar carrinho
    if (btnLimparCarrinho) {
        btnLimparCarrinho.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja limpar o carrinho?')) {
                clearCart();
            }
        });
    }

    // Função para renderizar itens do carrinho
    function renderCartItems() {
        cartItems.innerHTML = '';
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="cart-empty">Seu carrinho está vazio</p>';
            return;
        }

        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.produto}</div>
                    <div class="cart-item-price">R$ ${item.valor.toFixed(2).replace('.', ',')}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" data-produto="${item.produto}">−</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn plus" data-produto="${item.produto}">+</button>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });

        // Adicionar event listeners para os botões de quantidade
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const produto = this.getAttribute('data-produto');
                const isPlus = this.classList.contains('plus');
                const item = cart.find(i => i.produto === produto);
                
                if (item) {
                    if (isPlus) {
                        item.quantity++;
                    } else if (item.quantity > 1) {
                        item.quantity--;
                    }
                    saveCart();
                    renderCartItems();
                }
            });
        });
    }

    // Event listener para abrir modal do carrinho
    btnCart.addEventListener('click', function() {
        cartModal.style.display = 'block';
    });

    // Event listener para adicionar ao carrinho
    document.querySelectorAll('.btn-pedido').forEach(btn => {
        btn.addEventListener('click', function() {
            const produto = this.getAttribute('data-produto');
            const valor = parseFloat(this.getAttribute('data-valor'));
            
            const existingItem = cart.find(item => item.produto === produto);
            
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({
                    produto,
                    valor,
                    quantity: 1
                });
            }
            
            saveCart();
            renderCartItems();
            
            // Feedback visual
            const originalText = this.textContent;
            this.textContent = 'Adicionado!';
            this.style.backgroundColor = '#4CAF50';
            this.style.color = 'white';
            
            setTimeout(() => {
                this.textContent = originalText;
                this.style.backgroundColor = '';
                this.style.color = '';
            }, 1000);
        });
    });

    // Event listener para finalizar compra
    btnFinalizarCompra.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Seu carrinho está vazio!');
            return;
        }

        // Esconder modal do carrinho
        cartModal.style.display = 'none';

        // Mostrar modal de pedido
        modal.style.display = 'block';

        // Atualizar valor do PIX se estiver selecionado
        if (pixRadio && pixRadio.checked) {
            atualizarValorPix();
        }
    });

    // Função para atualizar valor do PIX
    function atualizarValorPix() {
        const totalCarrinho = cart.reduce((total, item) => total + (item.valor * item.quantity), 0);
        const valorFormatado = totalCarrinho.toFixed(2).replace('.', ',');
        document.getElementById('pix-valor').textContent = `R$ ${valorFormatado}`;
    }

    // Event listener para fechar modais
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Event listener para fechar modais clicando fora
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });

    // Atualizar formulário de pedido para incluir itens do carrinho
    const pedidoForm = document.getElementById('pedido-form');
    if (pedidoForm) {
        pedidoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            try {
                // Coletar dados do formulário
                const nomeCliente = document.getElementById('nome-cliente').value.trim();

                // Validar nome do cliente
                if (!nomeCliente) {
                    alert('Por favor, informe o nome do cliente para prosseguir com o pedido.');
                    document.getElementById('nome-cliente').focus();
                    return;
                }

                const tipoEntrega = document.getElementById('tipo-entrega').value;
                const dataEntrega = new Date(document.getElementById('data-entrega').value);
                const horaEntrega = document.getElementById('hora-entrega').value;
                const dataFormatada = dataEntrega.toLocaleDateString('pt-BR');

                // Obter informações de pagamento
                const metodoPagamento = document.querySelector('input[name="payment-method"]:checked');
                if (!metodoPagamento) {
                    alert('Por favor, selecione uma forma de pagamento.');
                    return;
                }

                const cpf = document.getElementById('cpf').value;

                // Validar endereço se for entrega
                let enderecoInfo = '';
                if (tipoEntrega === 'entrega') {
                    const endereco = document.getElementById('endereco').value.trim();
                    if (!endereco) {
                        alert('Por favor, informe o endereço de entrega.');
                        document.getElementById('endereco').focus();
                        return;
                    }
                    const complemento = document.getElementById('complemento').value;
                    const referencia = document.getElementById('referencia').value;
                    
                    enderecoInfo = `\n\n📍 *Endereço de Entrega:*\n${endereco}`;
                    if (complemento) enderecoInfo += `\n*Complemento:* ${complemento}`;
                    if (referencia) enderecoInfo += `\n*Ponto de Referência:* ${referencia}`;
                }

                // Criar lista de itens do carrinho
                const itensCarrinho = cart.map(item => 
                    `- ${item.produto} x${item.quantity} = R$ ${(item.valor * item.quantity).toFixed(2)}`
                ).join('\n');

                const totalCarrinho = cart.reduce((total, item) => total + (item.valor * item.quantity), 0);

                // Mensagem específica para pagamento PIX
                let pagamentoInfo = `💳 *Forma de Pagamento:* ${metodoPagamento ? metodoPagamento.value.toUpperCase() : 'Não selecionado'}`;
                if (metodoPagamento && metodoPagamento.value === 'pix') {
                    pagamentoInfo += '\n\n⚠️ *Importante:*\nPor favor, envie o comprovante do PIX para confirmarmos seu pedido.';
                }

                const mensagem = `*🎂 Novo Pedido T.T Refeições 🎂*

*Cliente:* ${nomeCliente}

*Itens do Pedido:*
━━━━━━━━━━━━━━━
${itensCarrinho}

*Total do Pedido:* R$ ${totalCarrinho.toFixed(2)}

*Detalhes da Entrega:*
━━━━━━━━━━━━━━━
📦 *Tipo de Entrega:* ${tipoEntrega}
📅 *Data de Entrega:* ${dataFormatada}
⏰ *Horário de Entrega:* ${horaEntrega}${enderecoInfo}

*Informações de Pagamento:*
━━━━━━━━━━━━━━━
${pagamentoInfo}
🆔 *CPF:* ${cpf || 'Não informado'}

_Por favor, confirme a disponibilidade e o valor total do pedido._`;

                // Número do WhatsApp formatado
                const numeroWhatsApp = '5592982377533';
                
                // Criar link do WhatsApp com a mensagem
                const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
                
                // Feedback para o usuário
                alert('Pedido registrado! Você será redirecionado para o WhatsApp para confirmar o pedido.');
                
                // Abrir WhatsApp em nova aba
                window.open(linkWhatsApp, '_blank');
                
                // Limpar carrinho e fechar modal
                cart = [];
                saveCart();
                updateCartCount();
                updateCartTotal();
                renderCartItems();
                modal.style.display = 'none';
                pedidoForm.reset();
                
            } catch (error) {
                console.error('Erro ao processar o pedido:', error);
                alert('Ocorreu um erro ao processar seu pedido. Por favor, tente novamente.');
            }
        });
    }

    // Máscara do CPF
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            let cpf = e.target.value;
            cpf = formatarCPF(cpf);
            
            // Limita o tamanho máximo para o formato XXX.XXX.XXX-XX
            if (cpf.length > 14) {
                cpf = cpf.slice(0, 14);
            }
            
            e.target.value = cpf;
        });

        // Impede caracteres não numéricos
        cpfInput.addEventListener('keypress', function(e) {
            const char = String.fromCharCode(e.keyCode);
            if (!/[0-9]/.test(char)) {
                e.preventDefault();
            }
        });
    }

    // Menu Mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');
    
    if (menuToggle && menu) {
        menuToggle.addEventListener('click', function() {
            menu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        // Fechar menu ao clicar em um link
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
    }

    // Configurar data mínima como hoje
    const dataEntrega = document.getElementById('data-entrega');
    if (dataEntrega) {
        const hoje = new Date();
        const dataMinima = hoje.toISOString().split('T')[0];
        dataEntrega.min = dataMinima;
    }

    // Gerenciar exibição do campo de endereço
    const tipoEntregaSelect = document.getElementById('tipo-entrega');
    const enderecoGrupo = document.getElementById('endereco-grupo');
    const enderecoInput = document.getElementById('endereco');
    
    if (tipoEntregaSelect) {
        tipoEntregaSelect.addEventListener('change', function() {
            if (this.value === 'entrega') {
                enderecoGrupo.style.display = 'block';
                enderecoInput.required = true;
            } else {
                enderecoGrupo.style.display = 'none';
                enderecoInput.required = false;
            }
        });
    }

    // Gerenciar opção de pagamento PIX
    if (pixRadio) {
        // Mostrar/ocultar informações do PIX
        document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.id === 'pix') {
                    // Atualizar valor do PIX
                    atualizarValorPix();
                    
                    // Mostrar área do PIX
                    pixInfo.style.display = 'block';
                    
                    // Limpar QR code anterior se existir
                    const qrcodeDiv = document.getElementById('qrcode');
                    qrcodeDiv.innerHTML = '';
                    
                    // Gerar QR Code com a chave PIX estática
                    qrcode = new QRCode(qrcodeDiv, {
                        text: '00020126330014BR.GOV.BCB.PIX0111013687132115204000053039865802BR5922Thays Oliveira Fonseca6009SAO PAULO621405105eidXprw366304C2F8',
                        width: 200,
                        height: 200,
                        colorDark: '#000000',
                        colorLight: '#ffffff',
                        correctLevel: QRCode.CorrectLevel.H
                    });
                } else {
                    pixInfo.style.display = 'none';
                }
            });
        });
    }

    // Event listener para atualizar valor do PIX quando o modal é aberto
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                if (modal.style.display === 'block' && pixRadio && pixRadio.checked) {
                    atualizarValorPix();
                }
            }
        });
    });

    observer.observe(modal, {
        attributes: true
    });

    // Função para copiar código PIX
    window.copyPixCode = function() {
        const pixCode = document.getElementById('pix-code');
        pixCode.select();
        document.execCommand('copy');
        
        // Feedback visual
        const btnCopy = document.querySelector('.btn-copy');
        const originalText = btnCopy.textContent;
        btnCopy.textContent = 'Copiado!';
        btnCopy.style.backgroundColor = '#4CAF50';
        btnCopy.style.color = 'white';
        
        setTimeout(() => {
            btnCopy.textContent = originalText;
            btnCopy.style.backgroundColor = '';
            btnCopy.style.color = '';
        }, 2000);
    };

    // Formulário de buffet
    const buffetForm = document.getElementById('buffet-form');
    if (buffetForm) {
        // Controles do seletor de pessoas
        const btnMenos = document.getElementById('btn-menos');
        const btnMais = document.getElementById('btn-mais');
        const quantidadePessoas = document.getElementById('quantidade-pessoas');

        // Função para atualizar a quantidade de pessoas
        function atualizarQuantidade(incremento) {
            let quantidade = parseInt(quantidadePessoas.value);
            quantidade += incremento;
            
            // Limitar entre 20 e 100
            if (quantidade >= 20 && quantidade <= 100) {
                quantidadePessoas.value = quantidade;
            }

            // Atualizar estado dos botões
            btnMenos.disabled = quantidade <= 20;
            btnMais.disabled = quantidade >= 100;
        }

        // Event listeners para os botões de quantidade
        btnMenos.addEventListener('click', () => atualizarQuantidade(-5));
        btnMais.addEventListener('click', () => atualizarQuantidade(5));

        // Inicializar estado dos botões
        atualizarQuantidade(0);

        // Submit do formulário
        buffetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Coletar itens selecionados
            const itens = [];
            document.querySelectorAll('input[name="buffet-items"]:checked').forEach(item => {
                // Pegar o texto do label associado ao checkbox
                const label = document.querySelector(`label[for="${item.id}"]`);
                if (label) {
                    itens.push(label.textContent);
                }
            });

            if (itens.length === 0) {
                alert('Por favor, selecione pelo menos um item para o buffet.');
                return;
            }

            const quantidade = quantidadePessoas.value;

            // Criar mensagem formatada para WhatsApp
            const mensagem = `*🎂 Solicitação de Orçamento - Buffet T.T Refeições 🎂*

*Itens Selecionados:*
━━━━━━━━━━━━━━━
${itens.map(item => `✓ ${item}`).join('\n')}

*Quantidade de Pessoas:* ${quantidade} pessoas

_Por favor, me envie um orçamento para os itens selecionados._`;

            // Número do WhatsApp formatado
            const numeroWhatsApp = '5592982377533';
            
            // Criar link do WhatsApp com a mensagem
            const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
            
            // Feedback para o usuário
            alert('Você será redirecionado para o WhatsApp para solicitar o orçamento.');
            
            // Abrir WhatsApp em nova aba
            window.open(linkWhatsApp, '_blank');
            
            // Resetar formulário
            buffetForm.reset();
            quantidadePessoas.value = '20'; // Resetar quantidade para o valor inicial
            atualizarQuantidade(0); // Atualizar estado dos botões
        });
    }

    // Formulário de contato
    const contatoForm = document.getElementById('contato-form');
    if (contatoForm) {
        contatoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            try {
                // Coletar dados do formulário
                const nome = document.getElementById('contato-nome').value;
                const email = document.getElementById('contato-email').value;
                const telefone = document.getElementById('contato-telefone').value;
                const mensagem = document.getElementById('contato-mensagem').value;

                // Criar mensagem formatada para WhatsApp
                const mensagemWhatsApp = `*📝 Nova Mensagem de Contato - T.T Refeições*

*Informações do Cliente:*
━━━━━━━━━━━━━━━
👤 *Nome:* ${nome}
📧 *E-mail:* ${email}
📱 *Telefone:* ${telefone}

*Mensagem:*
━━━━━━━━━━━━━━━
${mensagem}`;

                // Número do WhatsApp formatado
                const numeroWhatsApp = '5592982377533';
                
                // Criar link do WhatsApp com a mensagem
                const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagemWhatsApp)}`;
                
                // Feedback para o usuário
                alert('Você será redirecionado para o WhatsApp para enviar sua mensagem.');
                
                // Abrir WhatsApp em nova aba
                window.open(linkWhatsApp, '_blank');
                
                // Resetar formulário
                contatoForm.reset();
            } catch (error) {
                console.error('Erro ao processar mensagem:', error);
                alert('Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.');
            }
        });
    }

    // Smooth scroll para links do menu
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Animação de scroll para elementos
    function revelarElementos() {
        const elementos = document.querySelectorAll('.card, .combo-card, .contato-container');
        
        elementos.forEach(elemento => {
            const posicaoElemento = elemento.getBoundingClientRect().top;
            const alturaTela = window.innerHeight;
            
            if (posicaoElemento < alturaTela - 100) {
                elemento.style.opacity = '1';
                elemento.style.transform = 'translateY(0)';
            }
        });
    }

    // Adicionar estilos iniciais para animação
    const elementosAnimados = document.querySelectorAll('.card, .combo-card, .contato-container');
    elementosAnimados.forEach(elemento => {
        elemento.style.opacity = '0';
        elemento.style.transform = 'translateY(50px)';
        elemento.style.transition = 'all 0.6s ease-out';
    });

    // Chamar função de revelação no scroll
    window.addEventListener('scroll', revelarElementos);
    // Chamar uma vez para elementos já visíveis
    revelarElementos();
}); 