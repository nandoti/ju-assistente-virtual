$.getScript("js/comandos.js");

if (
    localStorage.getItem("banco") !== null &&
    localStorage.getItem("banco") !== ""
) {
    banco = JSON.parse(localStorage.getItem("banco"));
    temBanco = true;
} else {
    console.log("Não tem um banco de dados ainda!");
    temBanco = false;
}

window.plugins.speechRecognition.hasPermission(
    function (permissao) {
        if (!permissao) {
            window.plugins.speechRecognition.requestPermission(
                function (temPermissao) {
                    app.dialog.alert("Permissão concedida: " + temPermissao);
                },
                function (erro) {
                    app.dialog.alert("Request Permission error: " + erro);
                }
            );
        }
    },
    function (error) {
        app.dialog.alert("hasPermission error: " + error);
    }
);

$("#BtnFalar").on("click", function () {
    let options = {
        language: "pt-BR",
        showPopup: false,
        showPartial: true,
    };

    window.plugins.speechRecognition.startListening(
        function (dados) {
            $.each(dados, function (index, texto) {
                $("#pergunta").html("").append(texto);

                var pergunta = $("#pergunta").html().toLowerCase();
                console.log("Ela entendeu: " + pergunta);

                if (temBanco) {
                    $.each(banco, function (index, item) {
                        if (pergunta == item.p_falada) {
                            falar(item.r_escrita, item.r_falada, false);
                        }
                    });
                }

                $.each(comandos, function (index, item) {
                    if (pergunta == item.entrada) {
                        if (item.especial) {
                            item.especial();
                        } else {
                            falar(item.retorno_escrito, item.retorno_falado, item.rota);
                        }
                    }
                });
            });
        },

        function (erro) {
            app.dialog.alert("Houve um erro: " + erro);
        },
        options
    );
});

function falar(r_escrita, r_falada, rota) {
    TTS.speak(
        {
            text: r_falada,
            locale: "pt-BR",
            rate: 0.75,
        },
        function () {
            console.log("A assistente falou: " + r_escrita);
            if (rota) {
                app.views.main.router.navigate(rota);
            }
        },
        function (erro) {
            app.dialog.alert("Houve um erro: " + erro);
        }
    );

    var typed = new Typed("#resposta", {
        strings: [r_escrita + "^1000", ""],
        typeSpeed: 40,
        showCursor: false,
        onComplete: function (self) {
            toastBottom = app.toast.create({
                text: "Fala concluída com sucesso!",
                closeTimeout: 2000,
            });
            toastBottom.open();
        },
    });
}
