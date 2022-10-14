//INICIALIZAÇÃO DO SEARCHBAR
var searchbar = app.searchbar.create({
  el: '.searchbar',
  searchContainer: '.list',
  searchIn: '.item-title',
  on: {
    search(sb, query, previousQuery) {
      console.log(query, previousQuery);
    }
  }
});

//BANCO DE DADOS LOCAL WEBSQL
//CRIA O BANCO SE NÃO EXISTIR OU ABRE O BANCO SE EXISTIR
var db = window.openDatabase("Banco", "1.0", "Banco", 25000000);

//SOLITIAMOS UMA TRANSAÇÃO PARA CRIAR UMA TABELA NO BANCO
db.transaction(criarTabela,
  //callback de Erro
  function (err) {
    app.dialog.alert('Erro ao criar tabela: ' + err);
    //callback de sucesso
  }, function () {
    console.log('Sucesso ao realizar transação Criar Tabela');
  });

//FUNÇÃO RESPONSÁVEL POR CRIAR A TABELA NO NOSSO BANCO
function criarTabela(tx) {
  tx.executeSql("CREATE TABLE IF NOT EXISTS memorias (id INTEGER primary key,p_escrita varchar(255),p_falada varchar(255), r_escrita varchar(255), r_falada varchar(255))");
}

//FUNÇÃO PARA LISTAR OS ITENS DO BANCO
function listarMemorias() {
  db.transaction(selecionarTudo,
    function (err) {
      app.dialog.alert('Erro ao realizar transação Selecionar Tudo: ' + err);
    }, function () {
      console.log('Sucesso ao realizar Transação Selecionar Tudo!');
    })
}

//FUNÇÃO PARA SELECIONAR TUDO
function selecionarTudo(tx) {
  tx.executeSql('SELECT * FROM memorias ORDER BY id', [],
    function (tx, dados) {
      //console.log(dados);
      var linhas = dados.rows.length;
      //SE AS LINHAS FOREM MAIOR QUE 0
      if (linhas == 0) {
        $("#comMemorias").addClass('display-none');
        $("#semMemorias").removeClass('display-none');
      } else {

        //MOSTRAR COM MEMORIAS A LISTA
        $("#comMemorias").removeClass('display-none');
        $("#semMemorias").addClass('display-none');

        //ALIMENTAR O CAMPO QUANTAS APRENDIDAS
        $("#qtAprendidas").html(linhas);
        $("#listaPerguntas").empty();

        //PERCORRER TODAS AS LINHAS DO BANCO
        for (i = 0; i < linhas; i++) {
          $("#listaPerguntas").append(`<li>
          <a href="#" data-popup=".popup-resposta" class="item-link item-content popup-open">
              <div class="item-inner">
                  <div class="item-title-row">
                      <div class="item-title fw-bold"><i class="mdi mdi-pencil"></i> ${dados.rows.item(i).p_escrita}</div>
                      <div class="item-after">
                          <span class="badge padding-left padding-right color-blue">ID: ${dados.rows.item(i).id}</span>
                      </div>
                  </div>
                  <div class="item-subtitle"><i class="mdi mdi-microphone"></i> ${dados.rows.item(i).p_falada}</div>

              </div>
          </a>
      </li>`)
        }

      }
    },
    //SE DER ERRADO
    function (erro) {
      app.dialog.alert('Erro ao puxar dados do banco: ' + erro);
    })
}

listarMemorias();

//CLICOU EM GRAVAR PERGUNTA
$("#gravarPergunta").on("click", function () {

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
        //COLOCAR O QUE ELA ENTENDE NO INPUT CHAMADO PERGUNTAENTENDIDA
        $("#perguntaEntendida").val(texto);
      })
    },
    //SE DER ERRO
    function (erro) {
      app.dialog.alert('Houve um erro: ' + erro);
    }, options)
})

//CLICOU EM SALVAR PERGUNTA
$('#salvarPergunta').on("click", function () {

  //RECUPERAR OS VALORES DOS CAMPOS INPUT
  var pergunta_escrita = $("#perguntaEscrita").val();
  var pergunta_falada = $("#perguntaEntendida").val();

  //VALIDAÇÃO PARA OS CAMPOS NÃO SEREM VAZIOS
  if (pergunta_escrita == "" || pergunta_falada == "") {
    app.dialog.alert('Por favor, preencha todos os campos!');
  } else {
    db.transaction(inserir,
      //CALLBACK DE ERRO
      function (err) {
        app.dialog.alert('Erro na transação Inserir: ' + err);
      },
      //CALLBACK DE SUCESSO
      function () {
        console.log('Sucesso ao realizar a transação de Inserir');

        //TOAST PARA INFORMAR O USUÁRIO DE QUE FOI SALVO COM SUCESSO
        toastSalvar = app.toast.create({
          icon: '<i class="mdi mdi-content-save"></i>',
          text: 'Salvo',
          position: 'center',
          closeTimeout: 2000,
        });
        toastSalvar.open();

        //ESVAZIAR OS CAMPOS
        $("#perguntaEscrita").val("");
        $("#perguntaEntendida").val("");

        //FOCAR NO PERGUNTA ESCRITA
        $("#perguntaEscrita").focus();

        listarMemorias();

      })
  }

  function inserir(tx) {
    tx.executeSql(`INSERT INTO memorias (p_escrita,p_falada) VALUES ('${pergunta_escrita}','${pergunta_falada}')`);
  }

})

//CLICOU EM APAGAR MEMORIAS
$("#apagarMemorias").on("click", function () {
  app.dialog.confirm('Tem certeza que quer apagar as memórias?', '<strong>Confirmação</strong>',
    function () {
      db.transaction(apagaBanco,
        function (err) {
          app.dialog.alert('Erro ao realizar Transação Apagar: ' + err);
        },
        function () {
          app.views.main.router.refreshPage();
        });

      function apagaBanco(tx) {
        tx.executeSql("DROP TABLE memorias", [],
          function () {
            app.dialog.alert('Nada mais faz sentido...', '<strong>Memórias Apagadas</strong>');
          },
          function (err) {
            app.dialog.alert('Falha ao apagar memórias: ' + err);
          });
      }

    })
})
