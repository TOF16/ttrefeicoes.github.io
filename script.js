// Função para formatar CPF
function formatarCPF(cpf) {
    cpf = cpf.replace(/\D/g, ''); // Remove tudo que não é número
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2'); // Coloca ponto após os primeiros 3 dígitos
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2'); // Coloca ponto após os segundos 3 dígitos
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Coloca hífen antes dos últimos 2 dígitos
    return cpf;
}

document.addEventListener('DOMContentLoaded', function() {
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

    // Modal
    const modal = document.getElementById('modal');
    const btnsOpenModal = document.querySelectorAll('.btn-pedido');
    const btnCloseModal = document.querySelector('.close');

    // Abrir modal
    btnsOpenModal.forEach(btn => {
        btn.addEventListener('click', function() {
            modal.style.display = 'block';
            // Pegar informações do produto
            const produto = this.getAttribute('data-produto');
            const valor = this.getAttribute('data-valor');
            
            // Guardar informações para usar no formulário
            sessionStorage.setItem('produtoSelecionado', produto);
            sessionStorage.setItem('valorSelecionado', valor);
        });
    });

    // Fechar modal
    btnCloseModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Fechar modal clicando fora
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Formulário de pedido
    const pedidoForm = document.getElementById('pedido-form');
    if (pedidoForm) {
        pedidoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            try {
                // Recuperar informações do produto
                const produto = sessionStorage.getItem('produtoSelecionado');
                const valor = sessionStorage.getItem('valorSelecionado');

                // Coletar dados do formulário
                const tipoEntrega = document.getElementById('tipo-entrega').value;
                const dataEntrega = new Date(document.getElementById('data-entrega').value);
                const horaEntrega = document.getElementById('hora-entrega').value;
                const dataFormatada = dataEntrega.toLocaleDateString('pt-BR');

                // Obter informações de pagamento
                const metodoPagamento = document.querySelector('input[name="payment-method"]:checked');
                const cpf = document.getElementById('cpf').value;
                const cpfCupom = document.getElementById('cpf-cupom').checked;

                // Informações de endereço se for entrega
                let enderecoInfo = '';
                if (tipoEntrega === 'entrega') {
                    const endereco = document.getElementById('endereco').value;
                    const complemento = document.getElementById('complemento').value;
                    const referencia = document.getElementById('referencia').value;
                    
                    enderecoInfo = `\n\n📍 *Endereço de Entrega:*\n${endereco}`;
                    if (complemento) enderecoInfo += `\n*Complemento:* ${complemento}`;
                    if (referencia) enderecoInfo += `\n*Ponto de Referência:* ${referencia}`;
                }

                const mensagem = `*🎂 Novo Pedido T.T Refeições 🎂*

*Detalhes do Pedido:*
━━━━━━━━━━━━━━━
🍽️ *Produto:* ${produto}
💰 *Valor:* R$ ${valor}
📦 *Tipo de Entrega:* ${tipoEntrega}
📅 *Data de Entrega:* ${dataFormatada}
⏰ *Horário de Entrega:* ${horaEntrega}${enderecoInfo}

*Informações de Pagamento:*
━━━━━━━━━━━━━━━
💳 *Forma de Pagamento:* ${metodoPagamento ? metodoPagamento.value.toUpperCase() : 'Não selecionado'}
🆔 *CPF:* ${cpf || 'Não informado'}
${cpfCupom ? '✅ CPF no Cupom Fiscal solicitado' : ''}

_Por favor, confirme a disponibilidade e o valor total do pedido._`;

                // Número do WhatsApp formatado
                const numeroWhatsApp = '5592982377533';
                
                // Criar link do WhatsApp com a mensagem
                const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
                
                // Feedback para o usuário
                alert('Pedido registrado! Você será redirecionado para o WhatsApp para confirmar o pedido.');
                
                // Abrir WhatsApp em nova aba
                window.open(linkWhatsApp, '_blank');
                
                // Fechar modal e resetar formulário
                modal.style.display = 'none';
                pedidoForm.reset();
                
            } catch (error) {
                console.error('Erro ao processar o pedido:', error);
                alert('Ocorreu um erro ao processar seu pedido. Por favor, tente novamente.');
            }
        });
    }

    // Formulário de buffet
    const buffetForm = document.getElementById('buffet-form');
    if (buffetForm) {
        buffetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Coletar itens selecionados
            const itens = [];
            document.querySelectorAll('input[name="buffet-items"]:checked').forEach(item => {
                itens.push(item.id);
            });

            // Aqui você pode adicionar a lógica para enviar a solicitação de orçamento
            console.log('Itens selecionados para buffet:', itens);

            // Feedback para o usuário
            alert('Solicitação de orçamento recebida! Entraremos em contato em breve.');
            buffetForm.reset();
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