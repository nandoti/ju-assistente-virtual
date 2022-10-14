//ASSIM QUE A ROTA INDEX COMEÇAR
//VERIFICAR SE TEM PERMISSAO DE USAR SPEECHRECOGNITION
window.plugins.speechRecognition.hasPermission(
    function (permissao) {
        //SE NÃO TIVER PERMISSAO
        if (!permissao) {
            //SOLICITAR A PERMISSÃO
            window.plugins.speechRecognition.requestPermission(
                function (temPermissao) {
                    app.dialog.alert('Permissão concedida: ' + temPermissao);
                }, function (erro) {
                    app.dialog.alert('Request Permission error: ' + erro);
                })

        }
    }, function (error) {
        app.dialog.alert('hasPermission error: ' + error);
    })

//CLICOU NO BOTÃO FALAR
$("#BtnFalar").on('click', function () {
    let options = {
        language: "pt-BR",
        showPopup: false,
        showPartial: true
    }

    //COMEÇOU A "ESCUTAR"
    window.plugins.speechRecognition.startListening(
        //SE SUCESSO
        function (dados) {
            $.each(dados, function (index, texto) {
                //COLOCAR O QUE ELA ENTENDE NO P CHAMADO PERGUNTA
                $("#pergunta").html("").append(texto);
                //PEGAR O VALOR DO QUE ELA ENTENDEU
                var pergunta = $("#pergunta").html().toLowerCase();

                //VERIFICAR SE O COMANDO É ESSE
                if (pergunta == "acessar memórias" || pergunta == "acessar memória") {
                    app.views.main.router.navigate('/memorias/');
                }

                if (pergunta == "qual é o seu nome" || pergunta == "qual é seu nome") {
                    // or with more options
                    TTS.speak({
                        text: 'Meu nome é Ju',
                        locale: 'pt-BR',
                        rate: 0.75
                    }, function () {
                        //SE ELA FALAR ESCREVER NA TELA A RESPOSTA
                        var typed = new Typed('#resposta', {
                            strings: ['Meu nome é Ju ^1000', ''],
                            typeSpeed: 40,
                            showCursor: false,
                            onComplete: function (self) {
                                toastBottom = app.toast.create({
                                    text: 'Fala concluída com sucesso!',
                                    closeTimeout: 2000,
                                });
                                toastBottom.open();
                            }

                        });
                    }, function (erro) {
                        app.dialog.alert('Houve um erro: ' + erro);
                    });
                }
            })
        },
        //SE DER ERRO
        function (erro) {
            app.dialog.alert('Houve um erro: ' + erro);
        }, options)
});