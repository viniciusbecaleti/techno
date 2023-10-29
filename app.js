const vm = new Vue({
  el: "#app",
  data: {
    produtos: [],
    produto: null,
    carrinho: [],
    carrinhoAtivo: false,
    alertaMensagem: "",
    alertaAtivo: false
  },
  filters: {
    numeroPreco(valor) {
      return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      })
    }
  },
  computed: {
    carrinhoTotal() {
      const total = this.carrinho.reduce((acc, curr) => acc + curr.preco, 0)

      return total
    }
  },
  methods: {
    async fetchProdutos() {
      const response = await fetch("./api/produtos.json")
      const data = await response.json()
      this.produtos = data
    },

    async fetchProduto(id) {
      const response = await fetch(`./api/produtos/${id}/dados.json`)
      const data = await response.json()
      this.produto = data
    },

    abrirModal(id) {
      this.fetchProduto(id)
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      })
    },

    fecharModal({ target, currentTarget }) {
      if (target === currentTarget) {
        this.produto = null
      }
    },

    fecharModalCarrinho({ target, currentTarget }) {
      if (target === currentTarget) {
        this.carrinhoAtivo = false 
      }
    },

    adicionarItem() {
      this.produto.estoque--

      const { id, nome, preco } = this.produto
      this.carrinho.push({ id, nome, preco })

      this.alerta(`${nome} foi adicionado ao carrinho.`)
    },

    removerItem(index) {
      this.carrinho.splice(index, 1)
    },

    checarLocalStorage() {
      if (window.localStorage.carrinho) {
        this.carrinho = JSON.parse(window.localStorage.carrinho)
      }
    },

    compararEstoque() {
      const items = this.carrinho.filter(item => item.id === this.produto.id)
      this.produto.estoque -= items.length
    },

    alerta(mensagem) {
      this.alertaMensagem = mensagem
      this.alertaAtivo = true
      
      setTimeout(() => {
        this.alertaAtivo = false
      }, 1500)
    },

    router() {
      const hash = document.location.hash.replace("#", "")

      if (!hash) {
        return
      }

      this.fetchProduto(hash)
    }
  },
  watch: {
    carrinho() {
      window.localStorage.carrinho = JSON.stringify(this.carrinho)
    },

    produto() {
      if (!this.produto) {
        document.title = "Techno"
        history.pushState(null, null, `${window.location.origin}${window.location.pathname}`)
        return
      }
      
      document.title = `${this.produto.nome}`

      const hash = this.produto.id || ""
      history.pushState(null, null, `#${hash}`)

      this.compararEstoque()
    }
  },
  created() {
    this.fetchProdutos()
    this.checarLocalStorage()
    this.router()
  }
})