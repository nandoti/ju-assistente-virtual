var searchbar = app.searchbar.create({
  el: ".searchbar",
  searchContainer: ".list",
  searchIn: ".item-title",
  on: {
    search(sb, query, previousQuery) {
      console.log(query, previousQuery);
    },
  },
});

var db = window.openDatabase("Banco", "1.0", "Banco", 25000000);

db.transaction(
  criarTabela,

  function (err) {
    app.dialog.alert("Erro ao criar tabela: " + err);
  },
  function () {
    console.log("Sucesso ao realizar transação Criar Tabela");
  }
);

function criarTabela(tx) {
  tx.executeSql(
    "CREATE TABLE IF NOT EXISTS memorias (id INTEGER primary key,p_escrita varchar(255),p_falada varchar(255), r_escrita varchar(255), r_falada varchar(255))"
  );
}

function listarMemorias() {
  db.transaction(
    selecionarTudo,
    function (err) {
      app.dialog.alert("Erro ao realizar transação Selecionar Tudo: " + err);
    },
    function () {
      console.log("Sucesso ao realizar Transação Selecionar Tudo!");
    }
  );
}

function selecionarTudo(tx) {
  tx.executeSql(
    "SELECT * FROM memorias ORDER BY id",
    [],
    function (tx, dados) {
      //console.log(dados);
      var linhas = dados.rows.length;

      if (linhas == 0) {
        $("#comMemorias").addClass("display-none");
        $("#semMemorias").removeClass("display-none");
      } else {
        $("#comMemorias").removeClass("display-none");
        $("#semMemorias").addClass("display-none");

        $("#qtAprendidas").html(linhas);
        $("#listaPerguntas").empty();

        var banco = [];

        for (i = 0; i < linhas; i++) {
          banco.push({
            p_escrita: dados.rows.item(i).p_escrita,
            p_falada: dados.rows.item(i).p_falada,
            r_escrita: dados.rows.item(i).r_escrita,
            r_falada: dados.rows.item(i).r_falada,
          });

          localStorage.setItem("banco", JSON.stringify(banco));

          $("#listaPerguntas").append(`<li>
          <a href="#" data-id="${dados.rows.item(i).id}" data-pescrita="${dados.rows.item(i).p_escrita
            }" data-pfalada="${dados.rows.item(i).p_falada}" data-rescrita="${dados.rows.item(i).r_escrita
            }" data-rfalada="${dados.rows.item(i).r_falada
            }" data-popup=".popup-resposta" class="item-link item-content popup-open">
              <div class="item-inner">
                  <div class="item-title-row">
                      <div class="item-title fw-bold"><i class="mdi mdi-pencil"></i> ${dados.rows.item(i).p_escrita
            }</div>
                      <div class="item-after">
                          <span class="badge padding-left padding-right color-blue">ID: ${dados.rows.item(i).id
            }</span>
                      </div>
                  </div>
                  <div class="item-subtitle"><i class="mdi mdi-microphone"></i> ${dados.rows.item(i).p_falada
            }</div>

              </div>
          </a>
      </li>`);
        }

        $(".item-link").on("click", function () {
          $("#input_rescrita").val("");
          $("#input_rfalada").val("");

          var idItem = $(this).attr("data-id");
          localStorage.setItem("idItem", idItem);
          var itemPerguntaEscrita = $(this).attr("data-pescrita");
          var itemPerguntaFalada = $(this).attr("data-pfalada");
          var itemRespostaEscrita = $(this).attr("data-rescrita");
          var itemRespostaFalada = $(this).attr("data-rfalada");

          $("#idDoItem").html("ID: " + idItem);

          if (itemRespostaEscrita !== null && itemRespostaEscrita !== "null") {
            $("#input_rescrita").val(itemRespostaEscrita);
          }

          if (itemRespostaFalada !== null && itemRespostaFalada !== "null") {
            $("#input_rfalada").val(itemRespostaFalada);
          }

          $("#input_rescrita").focus();
        });

        $(".item-link").on("taphold", function () {
          var idItem = $(this).attr("data-id");
          localStorage.setItem("idItem", idItem);
          var itemPerguntaEscrita = $(this).attr("data-pescrita");
          var itemPerguntaFalada = $(this).attr("data-pfalada");
          var itemRespostaEscrita = $(this).attr("data-rescrita");
          var itemRespostaFalada = $(this).attr("data-rfalada");

          app.dialog
            .create({
              title: "OPÇÕES",
              text: "Escolha uma das opções abaixo:",
              buttons: [
                {
                  text: '<i class="mdi mdi-refresh"></i> Atualizar pergunta',
                  color: "blue",
                  onClick: function () {
                    $("#fabSalvar").addClass("display-none");

                    $("#fabAtualizar").removeClass("display-none");

                    $("#perguntaEscrita").val(itemPerguntaEscrita);
                    $("#perguntaEntendida").val(itemPerguntaFalada);

                    app.popup.open(".popup-pergunta");
                  },
                },
                {
                  text: '<i class="mdi mdi-delete"></i> Deletar esta memória',
                  color: "red",
                  onClick: function () {
                    app.dialog.confirm(
                      "Tem certeza que quer deletar a memória: <strong>ID: " +
                      idItem +
                      " e pergunta escrita: " +
                      itemPerguntaEscrita +
                      "</strong>?",
                      "CONFIRMAÇÃO",
                      function () {
                        deletarMemoria();
                      }
                    );
                  },
                },
                {
                  text: "Cancelar",
                  color: "gray",
                  onClick: function () { },
                },
              ],
              verticalButtons: true,
            })
            .open();
        });

        $("#input_rescrita").on("blur", function () {
          $("#input_rfalada").val($("#input_rescrita").val());
        });

        $("#BtnFalarResposta").on("click", function () {
          var fala = $("#input_rfalada").val();

          TTS.speak(
            {
              text: fala,
              locale: "pt-BR",
              rate: 0.75,
            },
            function () {
              console.log("Assistente falou!");
            },
            function (erro) {
              app.dialog.alert("Houve um erro: " + erro);
            }
          );
        });

        $("#salvarRespostas").on("click", function () {
          var id = localStorage.getItem("idItem");

          var escrita = $("#input_rescrita").val();

          var falada = $("#input_rfalada").val().toLowerCase();

          db.transaction(
            atualizarTabela,
            function (err) {
              app.dialog.alert("Erro ao atualizar tabela: " + err);
            },
            function () {
              console.log("Sucesso ao atualizar a tabela");
            }
          );

          function atualizarTabela(tx) {
            tx.executeSql(
              "UPDATE memorias SET r_escrita='" +
              escrita +
              "', r_falada='" +
              falada +
              "' WHERE id='" +
              id +
              "'  "
            );
          }

          tostSalvar();

          $("#input_rescrita").val("");
          $("#input_rfalada").val("");

          app.popup.close(".popup-resposta");

          app.views.main.router.refreshPage();
        });
      }
    },

    function (erro) {
      app.dialog.alert("Erro ao puxar dados do banco: " + erro);
    }
  );
}

listarMemorias();

$("#gravarPergunta").on("click", function () {
  let options = {
    language: "pt-BR",
    showPopup: false,
    showPartial: true,
  };

  window.plugins.speechRecognition.startListening(
    function (dados) {
      $.each(dados, function (index, texto) {
        $("#perguntaEntendida").val(texto);
      });
    },

    function (erro) {
      app.dialog.alert("Houve um erro: " + erro);
    },
    options
  );
});

$("#salvarPergunta").on("click", function () {
  var pergunta_escrita = $("#perguntaEscrita").val();
  var pergunta_falada = $("#perguntaEntendida").val().toLowerCase();

  if (pergunta_escrita == "" || pergunta_falada == "") {
    app.dialog.alert("Por favor, preencha todos os campos!");
  } else {
    db.transaction(
      inserir,

      function (err) {
        app.dialog.alert("Erro na transação Inserir: " + err);
      },

      function () {
        console.log("Sucesso ao realizar a transação de Inserir");

        tostSalvar();

        $("#perguntaEscrita").val("");
        $("#perguntaEntendida").val("");

        $("#perguntaEscrita").focus();

        app.views.main.router.refreshPage();
      }
    );
  }

  function inserir(tx) {
    tx.executeSql(
      `INSERT INTO memorias (p_escrita,p_falada) VALUES ('${pergunta_escrita}','${pergunta_falada}')`
    );
  }
});

$("#apagarMemorias").on("click", function () {
  app.dialog.confirm(
    "Tem certeza que quer apagar as memórias?",
    "<strong>Confirmação</strong>",
    function () {
      db.transaction(
        apagaBanco,
        function (err) {
          app.dialog.alert("Erro ao realizar Transação Apagar: " + err);
        },
        function () {
          app.views.main.router.refreshPage();
        }
      );

      function apagaBanco(tx) {
        tx.executeSql(
          "DROP TABLE memorias",
          [],
          function () {
            localStorage.removeItem("banco");
            app.dialog.alert(
              "Nada mais faz sentido...",
              "<strong>Memórias Apagadas</strong>"
            );
          },
          function (err) {
            app.dialog.alert("Falha ao apagar memórias: " + err);
          }
        );
      }
    }
  );
});

function deletarMemoria() {
  db.transaction(
    deletar,
    function (err) {
      app.dialog.alert("Erro ao deletar item: " + err);
    },
    function () {
      console.log("Sucesso ao deletar item da tabela!");
      app.views.main.router.refreshPage();
    }
  );
}

function deletar(tx) {
  var id = localStorage.getItem("idItem");
  tx.executeSql('DELETE FROM memorias WHERE id="' + id + '"');
}

$("#atualizarPergunta").on("click", function () {
  var id = localStorage.getItem("idItem");

  var perguntaEscrita = $("#perguntaEscrita").val();

  var perguntaFalada = $("#perguntaEntendida").val().toLowerCase();

  db.transaction(
    atualizarTabelaPergunta,
    function (err) {
      app.dialog.alert("Erro ao atualizar tabela: " + err);
    },
    function () {
      console.log("Sucesso ao atualizar a tabela");
    }
  );

  function atualizarTabelaPergunta(tx) {
    tx.executeSql(
      "UPDATE memorias SET p_escrita='" +
      perguntaEscrita +
      "', p_falada='" +
      perguntaFalada +
      "' WHERE id='" +
      id +
      "'  "
    );
  }

  tostSalvar();

  $("#perguntaEscrita").val("");
  $("#perguntaEntendida").val("");

  app.popup.close(".popup-pergunta");

  app.views.main.router.refreshPage();
});

$(".cancel").on("click", function () {
  app.popup.close(".popup-pergunta");

  app.views.main.router.refreshPage();
});

function tostSalvar() {
  toastSalvar = app.toast.create({
    icon: '<i class="mdi mdi-content-save"></i>',
    text: "Salvo",
    position: "center",
    closeTimeout: 2000,
  });
  toastSalvar.open();
}
