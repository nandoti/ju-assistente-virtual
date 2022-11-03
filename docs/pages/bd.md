## Funcionamento do banco de dados

# INICIALIZAÇÃO DO SEARCHBAR

```
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
  ```

 #  BANCO DE DADOS LOCAL WEBSQL
 
  # CRIA O BANCO SE NÃO EXISTIR OU ABRE O BANCO SE EXISTIR
  
  ```
  var db = window.openDatabase("Banco","1.0","Banco",25000000);
```

# SOLITIAMOS UMA TRANSAÇÃO PARA CRIAR UMA TABELA NO BANCO

```
  db.transaction(criarTabela,
  
    function(err){
      app.dialog.alert('Erro ao criar tabela: '+err);

    },function(){
      console.log('Sucesso ao realizar transação Criar Tabela');
    });
```

# FUNÇÃO RESPONSÁVEL POR CRIAR A TABELA NO NOSSO BANCO

```
  function criarTabela(tx){
    tx.executeSql("CREATE TABLE IF NOT EXISTS memorias (id INTEGER primary key,p_escrita varchar(255),p_falada varchar(255), r_escrita varchar(255), r_falada varchar(255))");
  }
```

# FUNÇÃO PARA LISTAR OS ITENS DO BANCO

```
  function listarMemorias(){
    db.transaction(selecionarTudo,
      function(err){
        app.dialog.alert('Erro ao realizar transação Selecionar Tudo: '+err);
      },function(){
        console.log('Sucesso ao realizar Transação Selecionar Tudo!');
      })
  }
  
  ```

# FUNÇÃO PARA SELECIONAR TUDO

```
  function selecionarTudo(tx){
    tx.executeSql('SELECT * FROM memorias ORDER BY id',[],
    function(tx, dados){
      //console.log(dados);
      var linhas = dados.rows.length;
```

### SE AS LINHAS FOREM MAIOR QUE 0

```
      if(linhas==0){
        $("#comMemorias").addClass('display-none');
        $("#semMemorias").removeClass('display-none');
      }else{
```

# MOSTRAR COM MEMORIAS A LISTA

```
        $("#comMemorias").removeClass('display-none');
        $("#semMemorias").addClass('display-none');
```

# ALIMENTAR O CAMPO QUANTAS APRENDIDAS

```
        $("#qtAprendidas").html(linhas);
        $("#listaPerguntas").empty();

        var banco = [];
```

### PERCORRER TODAS AS LINHAS DO BANCO

```
        for(i=0; i< linhas; i++){
```

### ADICIONAR DENTRO DO ARRAY BANCO OS DADOS

```
          banco.push({
              p_escrita: dados.rows.item(i).p_escrita,
              p_falada: dados.rows.item(i).p_falada,
              r_escrita: dados.rows.item(i).r_escrita,
              r_falada: dados.rows.item(i).r_falada,
          })
```

### SALVAR TODO O BANCO NO LOCALSTORAGE

```
          localStorage.setItem('banco',JSON.stringify(banco));

          $("#listaPerguntas").append(`<li>
          <a href="#" data-id="${dados.rows.item(i).id}" data-pescrita="${dados.rows.item(i).p_escrita}" data-pfalada="${dados.rows.item(i).p_falada}" data-rescrita="${dados.rows.item(i).r_escrita}" data-rfalada="${dados.rows.item(i).r_falada}" data-popup=".popup-resposta" class="item-link item-content popup-open">
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
```

### CLICOU NUM ITEM DA LISTA

```
        $(".item-link").on('click', function(){
```

### ERRAR OS CAMPINHOS INPUT

```
          $("#input_rescrita").val('');
          $("#input_rfalada").val(''); 
```

### RECUPERAR INFORMAÇÕES DESTE ITEM DA LISTA

```
          var idItem = $(this).attr('data-id');
          localStorage.setItem('idItem',idItem);
          var itemPerguntaEscrita = $(this).attr('data-pescrita');
          var itemPerguntaFalada = $(this).attr('data-pfalada');
          var itemRespostaEscrita = $(this).attr('data-rescrita');
          var itemRespostaFalada = $(this).attr('data-rfalada');
```

### ALIMENTAR ID DO POPUP RESPOSTA

```

          $("#idDoItem").html('ID: '+idItem);
```

### SE A RESPOSTA NÃO FOR NULA ALIMENTAR O CAMPO

```
          if(itemRespostaEscrita!==null && itemRespostaEscrita!=="null"){
            $("#input_rescrita").val(itemRespostaEscrita);
          }

          if(itemRespostaFalada!==null && itemRespostaFalada!=="null"){
            $("#input_rfalada").val(itemRespostaFalada);
          }
```

### FOCAR NO CAMPINHO INPUT RESCRITA

```
          $("#input_rescrita").focus();

        });
```

### CLICOU E SEGUROU O CLIQUE

```
        $(".item-link").on('taphold', function(){
```
        
### RECUPERAR INFORMAÇÕES DESTE ITEM DA LISTA

```
          var idItem = $(this).attr('data-id');
          localStorage.setItem('idItem',idItem);
          var itemPerguntaEscrita = $(this).attr('data-pescrita');
          var itemPerguntaFalada = $(this).attr('data-pfalada');
          var itemRespostaEscrita = $(this).attr('data-rescrita');
          var itemRespostaFalada = $(this).attr('data-rfalada');

          app.dialog.create({
            title: 'OPÇÕES',
            text: 'Escolha uma das opções abaixo:',
            buttons: [
              {
                text: '<i class="mdi mdi-refresh"></i> Atualizar pergunta',
                color: 'blue',
                onClick: function(){
 ```               

### DESAPARECER O BOTAO SALVAR

```
                  $("#fabSalvar").addClass('display-none');
                  
```

### APARECER O BOTAO ATUALIZAR

```
                  $("#fabAtualizar").removeClass('display-none');
```

### ALIMENTAR OS CAMPOS DO POPUP

```
                  $("#perguntaEscrita").val(itemPerguntaEscrita);
                  $("#perguntaEntendida").val(itemPerguntaFalada);
```

### ABRIR O POPUP DE PERGUNTA

```
                  app.popup.open('.popup-pergunta');

                }
              },
              {
                text: '<i class="mdi mdi-delete"></i> Deletar esta memória',
                color: 'red',
                onClick: function(){
                    app.dialog.confirm('Tem certeza que quer deletar a memória: <strong>ID: '+idItem+' e pergunta escrita: '+itemPerguntaEscrita+'</strong>?','CONFIRMAÇÃO', function(){
                      deletarMemoria();
                    });
                }
              },
              {
                text: 'Cancelar',
                color: 'gray',
                onClick: function(){
                  
                }
              }
            ],
            verticalButtons: true
          }).open()
          

        });
```

### SAIU DO FOCO DO CAMPO INPUT R ESCRITA

```
        $("#input_rescrita").on('blur', function(){
          $("#input_rfalada").val($("#input_rescrita").val());
        });
```

### CLICOU NO BOTÃO PARA ASSISTENTE FALAR

```
        $("#BtnFalarResposta").on('click', function(){
 ```
 
### RECUPERAR O VALOR DO INPUT R FALADA

```
          var fala =  $("#input_rfalada").val();
          
          TTS.speak({
            text: fala,
            locale: 'pt-BR',
            rate: 0.75
            }, function () {
                console.log('Assistente falou!');
            }, function (erro) {
                app.dialog.alert('Houve um erro: '+erro);
            });
        });
```

### CLICOU NO BOTÃO PARA SALVAR AS RESPOSTAS

```
        $("#salvarRespostas").on('click', function(){
```

### RECUPERA O ID

```
          var id =  localStorage.getItem('idItem');  
```

### RECUPERAR O VALOR DO INPUT R FALADA

```
          var escrita =  $("#input_rescrita").val();
```

### RECUPERAR O VALOR DO INPUT R FALADA

```
          var falada =  $("#input_rfalada").val().toLowerCase(); 
 ```
 
### INICIAR TRANSAÇÃO COM BANCO DE DADOS

```
          db.transaction(atualizarTabela,
            function(err){
              app.dialog.alert('Erro ao atualizar tabela: '+err);
            },function(){
              console.log('Sucesso ao atualizar a tabela');
            });
            
            function atualizarTabela(tx){
              tx.executeSql("UPDATE memorias SET r_escrita='"+escrita+"', r_falada='"+falada+"' WHERE id='"+id+"'  ");
            }
 ```
 
### TOST PARA DAR AVISO DE QUE SALVOU

```
            tostSalvar();
            
```
### ZERAR OS CAMPINHOS INPUT

```
            $("#input_rescrita").val('');
            $("#input_rfalada").val(''); 
```

### FECHAR O POPUP DA RESPOSTA

```
            app.popup.close('.popup-resposta');
```

### ATUALIZAR A PÁGINA

```
            app.views.main.router.refreshPage();
        });
      }
    }, 
    function(erro){
      app.dialog.alert('Erro ao puxar dados do banco: '+erro);
    })
  }
  listarMemorias();
```

### CLICOU EM GRAVAR PERGUNTA

```
  $("#gravarPergunta").on("click", function(){
```

    let options = {
      language: "pt-BR",          
      showPopup: false,  
      showPartial: true 
    }
    
### COMEÇOU A "ESCUTAR"

```
    window.plugins.speechRecognition.startListening(
    
      function(dados){
          $.each(dados,function(index,texto){
              //COLOCAR O QUE ELA ENTENDE NO INPUT CHAMADO PERGUNTAENTENDIDA
              $("#perguntaEntendida").val(texto);             
          })
      }, 
      function(erro){
         app.dialog.alert('Houve um erro: '+erro); 
      }, options)
  })
```

### CLICOU EM SALVAR PERGUNTA

```
  $('#salvarPergunta').on("click",function(){
```

### RECUPERAR OS VALORES DOS CAMPOS INPUT

```
    var pergunta_escrita = $("#perguntaEscrita").val();
    var pergunta_falada = $("#perguntaEntendida").val().toLowerCase();
```

### VALIDAÇÃO PARA OS CAMPOS NÃO SEREM VAZIOS

```
    if(pergunta_escrita=="" || pergunta_falada==""){
      app.dialog.alert('Por favor, preencha todos os campos!');
    }else{
      db.transaction(inserir, 
        function(err){
          app.dialog.alert('Erro na transação Inserir: '+err);
        }, 
        function(){
          console.log('Sucesso ao realizar a transação de Inserir');
```

## TOAST PARA INFORMAR O USUÁRIO DE QUE FOI SALVO COM SUCESSO

          tostSalvar();

### ESVAZIAR OS CAMPOS

```
        $("#perguntaEscrita").val("");
        $("#perguntaEntendida").val("");
```

### FOCAR NO PERGUNTA ESCRITA

```
        $("#perguntaEscrita").focus();
   ```
   
### ATUALIZAR A PÁGINA

```
        app.views.main.router.refreshPage();

        })
    }

    function inserir(tx){
      tx.executeSql(`INSERT INTO memorias (p_escrita,p_falada) VALUES ('${pergunta_escrita}','${pergunta_falada}')`);
    }

  })
```

### CLICOU EM APAGAR MEMORIAS

```
  $("#apagarMemorias").on("click",function(){
      app.dialog.confirm('Tem certeza que quer apagar as memórias?','<strong>Confirmação</strong>',
      function(){
        db.transaction(apagaBanco,
          function(err){
            app.dialog.alert('Erro ao realizar Transação Apagar: '+err);
          },
          function(){
            app.views.main.router.refreshPage();
          });

          function apagaBanco(tx){
            tx.executeSql("DROP TABLE memorias",[],
            function(){
  ```
  
### APAGAR O BANCO DO LOCALSTORAGE

```
              localStorage.removeItem('banco');
              app.dialog.alert('Nada mais faz sentido...','<strong>Memórias Apagadas</strong>');
            },
            function(err){
              app.dialog.alert('Falha ao apagar memórias: '+err);
            });
          }

      })
  })

function deletarMemoria(){
  db.transaction(deletar,
    function(err){
      app.dialog.alert('Erro ao deletar item: '+err);
  },function(){
    console.log('Sucesso ao deletar item da tabela!');
    app.views.main.router.refreshPage();
  })
}

function deletar(tx){
  var id = localStorage.getItem('idItem');
  tx.executeSql('DELETE FROM memorias WHERE id="'+id+'"');
}
```

### CLICOU PARA ATUALIZAR A PERGUNTA

```
$("#atualizarPergunta").on('click', function(){
```

### RECUPERA O ID

```
  var id =  localStorage.getItem('idItem');
 
 ```
 
### RECUPERAR O VALOR DO INPUT R FALADA

```
  var perguntaEscrita =  $("#perguntaEscrita").val();
```

### RECUPERAR O VALOR DO INPUT R FALADA

```
  var perguntaFalada =  $("#perguntaEntendida").val().toLowerCase();
```

### INICIAR TRANSAÇÃO COM BANCO DE DADOS

```
  db.transaction(atualizarTabelaPergunta,
    function(err){
      app.dialog.alert('Erro ao atualizar tabela: '+err);
    },function(){
      console.log('Sucesso ao atualizar a tabela');
    });

    function atualizarTabelaPergunta(tx){
      tx.executeSql("UPDATE memorias SET p_escrita='"+perguntaEscrita+"', p_falada='"+perguntaFalada+"' WHERE id='"+id+"'  ");
    }
  ```
  
### TOST PARA DAR AVISO DE QUE SALVOU

```
    tostSalvar();
```

### ZERAR OS CAMPINHOS INPUT

```
    $("#perguntaEscrita").val('');
    $("#perguntaEntendida").val(''); 
```

### FECHAR O POPUP DA RESPOSTA

```
    app.popup.close('.popup-pergunta');
```

### ATUALIZAR A PÁGINA

```
    app.views.main.router.refreshPage();
});

$(".cancel").on('click',function(){

```
### FECHAR O POPUP DA RESPOSTA

```
    app.popup.close('.popup-pergunta');

```

### TUALIZAR A PÁGINA

```
    app.views.main.router.refreshPage();
});

function tostSalvar(){

```

## TOAST DE SALVAR

```
  toastSalvar = app.toast.create({
    icon: '<i class="mdi mdi-content-save"></i>',
    text: 'Salvo',
    position: 'center',
    closeTimeout: 2000,
    });
    toastSalvar.open();
}
```
