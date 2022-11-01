comandos = [
    {
        entrada: "acessar memórias",
        retorno_escrito: "Sim, senhor!",
        retorno_falado: "Sim, senhor!",
        rota: "/memorias/",
        especial: false,
    },
    {
        entrada: "qual é o seu nome",
        retorno_escrito: "Meu nome é Ju!",
        retorno_falado: "Meu nome é Ju!",
        rota: false,
        especial: false,
    },
    {
        entrada: "enviar e-mail",
        retorno_escrito: "Para quem gostaria de enviar?",
        retorno_falado: "Para quem gostaria de enviar?",
        rota: false,
        especial: function () {
            falar(
                "Para quem gostaria de enviar?",
                "Para quem gostaria de enviar?",
                false
            );
            app.dialog.alert("Disparou o evento!");
        },
    },
];
