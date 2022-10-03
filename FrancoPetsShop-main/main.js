const { createApp } = Vue
createApp({

    data() {
        return {
            dataApi: [],//datos de todos los productos
            dataFarmacia: [],//datos de productos farmacia
            dataJuguetes: [],//datos de productos juguetes
            arrayFiltroPrecios: [],//array con valores de precios para filtrar
            arrayCarritoDeCompras: [],//array para llenar con productos 
            idProductosSolicitados: [],//array mappeado de los id productos solicitados
            finalizarCompra: [],//array donde guardo los datos para la compra
            productoDetalles: [],//array donde se filtra los productos para el details
            precioTotalCompra: 0,//strng para mostrar el precio en carrito
            inputValue: "",//valor del search
            juguetesFiltrados: [], //array con los juguetes 
            farmaciaFiltrados: [],//array con los prodcutos de farmacia
            selectValue: "",//valor del filtro select
            productoModal: {},//recorre los productos para mostrar en el modal
            productosEnOfertas: [],//array con productos filtrados por su stock, se muestra en home
            cantTotalCarro: 0,//propiedad q muestra la cantidad de productos en el carro
            CatDog: {animal:'cat', imagen: './assets/img/gato.png'}      

        }
    },

    created() {

        fetch("https://apipetshop.herokuapp.com/api/articulos").then(response => response.json()).then(data => {
            this.dataApi = data.response
            this.dataApi.forEach(element => {
                element.contador = 0
                this.productoModal = this.dataApi[0]
            });
            this.filtrarPorProducto()
            this.produtosOfertas()

            let estiloEnStorage = JSON.parse(localStorage.getItem('estilo'));
            if (estiloEnStorage) {
                this.CatDog = estiloEnStorage;
            }

            this.cargainicialCatDog()

            let productosEnStorage = JSON.parse(localStorage.getItem('productosEnElCarrito'))
            if (productosEnStorage) {
                this.arrayCarritoDeCompras = JSON.parse(localStorage.getItem('productosEnElCarrito'))
            }//cargamos el localStorage en el carrito para tener los mismos valores en las paginas
        })
    },

    methods: {
        filtrarPorProducto() {

            this.dataFarmacia = this.dataApi.filter(data => data.tipo === "Medicamento");
            this.dataJuguetes = this.dataApi.filter(data => data.tipo === "Juguete");


        },//guardamos los filtros por farmacia y juguetes en dos array

        agregarAlCarrito(producto, mensaje) {
            this.mostrarMensaje(mensaje)

            this.idProductosSolicitados = this.arrayCarritoDeCompras.map(producto => producto._id)
            if (!this.idProductosSolicitados.includes(producto._id)) {
                this.arrayCarritoDeCompras.push(producto)
                producto.contador = 1
                localStorage.setItem('productosEnElCarrito', JSON.stringify(this.arrayCarritoDeCompras))
            } else if (producto.contador < producto.stock) {
                let productoModificado = this.arrayCarritoDeCompras.filter(pro => pro._id == producto._id)[0]
                productoModificado.contador++
                this.arrayCarritoDeCompras.forEach(pro => {
                    if (productoModificado._id == pro._id) {
                        pro = productoModificado;
                        producto.contador = productoModificado.contador
                    }
                })
                 localStorage.setItem('productosEnElCarrito', JSON.stringify(this.arrayCarritoDeCompras))
            }
            console.log(localStorage);
        },//agrega producto al carro y muestra cartel de q se agrago

        quitarDelCarrito(producto, mensaje) {
            this.mostrarMensaje(mensaje)

            this.idProductosSolicitados = this.arrayCarritoDeCompras.map(producto => producto._id)
            if (this.idProductosSolicitados.includes(producto._id)) {
                this.arrayCarritoDeCompras = this.arrayCarritoDeCompras.filter(pro => pro._id != producto._id)
                producto.contador = 0
                localStorage.setItem('productosEnElCarrito', JSON.stringify(this.arrayCarritoDeCompras))
            }

        },//quita del carro y muestra cartel de q se quito

        quitarUnidadProducto(producto, mensaje){
            this.mostrarMensaje(mensaje)
            this.idProductosSolicitados = this.arrayCarritoDeCompras.map(producto => producto._id)
            if (producto.contador > 0) {
                let productoModificado = this.arrayCarritoDeCompras.filter(pro => pro._id == producto._id)[0]
                productoModificado.contador--
                this.arrayCarritoDeCompras.forEach(pro => {
                    if (productoModificado._id == pro._id) {
                        pro = productoModificado;
                        producto.contador = productoModificado.contador
                    }
                })
                 localStorage.setItem('productosEnElCarrito', JSON.stringify(this.arrayCarritoDeCompras))
            }
        },//resta del contador de productos en la tarjeta con el boton menos
        comprarCancelar(mensaje) {
            this.mostrarMensaje(mensaje)
            localStorage.removeItem('productosEnElCarrito')
            this.arrayCarritoDeCompras = []
        },//funcion q carga el mensaje para mostrar segun accion comprar o cancelar, y vacio el carrito(borra el localStorage [productosEnElCarrito])

        filtroSearchFarmacia() {
            this.farmaciaFiltrados = this.dataFarmacia.filter(producto =>
                (producto.nombre + producto.descripcion).toLowerCase().includes(this.inputValue.toLowerCase())
            )
        },//filtra por input search el array de farmacia

        filtroSearchJueguete() {
            this.juguetesFiltrados = this.dataJuguetes.filter(producto =>
                (producto.nombre + producto.descripcion).toLowerCase().includes(this.inputValue.toLowerCase())
            )
        },//filtra por input search el array de juguetes

        verDetalles(producto) {
            this.productoModal = producto;
        },//toma el producto para mostrarlo con el modal

        produtosOfertas() {
            this.productosEnOfertas = this.dataApi
            this.productosEnOfertas.sort((a, b) => {
                return a.stock - b.stock;
            })
            this.productosEnOfertas = this.productosEnOfertas.slice(0, 3)
        },//array con los productos en oferta(filtra por stock de menor a mayor y nos devuelve los 3 primeros)

        verificarContador(arrayProductos) {
            if (this.arrayCarritoDeCompras.length) {
                this.arrayCarritoDeCompras.forEach(producto => {
                    arrayProductos.forEach(pro => {
                        if (pro._id == producto._id) {
                            pro.contador = producto.contador
                        }
                    })
                })
            }
        },//tomamos el array pasado como argumento y por cada elemento  igualamos al valor de contador con el array del carrito compras

        mostrarMensaje(mensaje) {
            let textoAgregar = document.getElementById('agregar')
            textoAgregar.innerText = mensaje;
            let toastLiveExample = document.getElementById('liveToast')
            const toast = new bootstrap.Toast(toastLiveExample)
            toast.show()
        },//muestra el mensaje pasado por argumento en el modal

        estiloCatDog(){
            if (this.CatDog.animal == 'cat') {
                var bodyStyles = document.body.style;
                bodyStyles.setProperty('--gradiente-blanco', '255, 255, 255, 0.361');
                bodyStyles.setProperty('--box-shadow-blanco', '255, 255, 255, 1');
                bodyStyles.setProperty('--fondo-claro', '#ffffff');
                bodyStyles.setProperty('--main-text-color', '#060606');
                bodyStyles.setProperty('--p-text-color', '#151515e6');
                bodyStyles.setProperty('--aviso-carta', '#1B2430;');
                
                
                this.CatDog.animal='dog';
                this.CatDog.imagen= './assets/img/perro.png'  
                localStorage.setItem('estilo', JSON.stringify(this.CatDog));
            } else {
                var bodyStyles = document.body.style;
                bodyStyles.setProperty('--gradiente-blanco', '27, 36, 48, 0.661');
                bodyStyles.setProperty('--box-shadow-blanco', '27, 36, 48');
                bodyStyles.setProperty('--fondo-claro', '#1B2430');
                bodyStyles.setProperty('--main-text-color', '#F5F5F5');
                bodyStyles.setProperty('--p-text-color', '#F5F5F5');
                bodyStyles.setProperty('--aviso-carta', '#1B2430;');
               
                
                this.CatDog.animal='cat';
                this.CatDog.imagen= './assets/img/gato.png' 
                localStorage.setItem('estilo', JSON.stringify(this.CatDog));
        }},

        cargainicialCatDog(){
            if (this.CatDog.animal == 'cat'){
                var bodyStyles = document.body.style;
                bodyStyles.setProperty('--gradiente-blanco', '27, 36, 48, 0.661');
                bodyStyles.setProperty('--box-shadow-blanco', '27, 36, 48');
                bodyStyles.setProperty('--fondo-claro', '#1B2430');
                bodyStyles.setProperty('--main-text-color', '#F5F5F5');
                bodyStyles.setProperty('--p-text-color', '#F5F5F5');
                bodyStyles.setProperty('--aviso-carta', '#1B2430;');
             
            } else {
                var bodyStyles = document.body.style;
                bodyStyles.setProperty('--gradiente-blanco', '255, 255, 255, 0.361');
                bodyStyles.setProperty('--box-shadow-blanco', '255, 255, 255, 1');
                bodyStyles.setProperty('--fondo-claro', '#ffffff');
                bodyStyles.setProperty('--main-text-color', '#060606');
                bodyStyles.setProperty('--p-text-color', '#151515e6');
                bodyStyles.setProperty('--aviso-carta', '#1B2430;');
              
            }
        }

    
    },
    computed: {
        sumaTotalCompra() {
            this.precioTotalCompra = 0
            this.arrayCarritoDeCompras.forEach(producto => {
                this.precioTotalCompra += producto.precio * producto.contador
            })
        },//suma el (precio*contador) de cada producto en el carrito

        filtroSearch() {
            if (this.inputValue.lenght != 0) {
                if (window.location.href.includes("farmacia")) {
                    this.filtroSearchFarmacia()
                } else {
                    this.filtroSearchJueguete()
                }
            } else {
                this.farmaciaFiltrados = this.dataFarmacia;
                this.juguetesFiltrados = this.dataJuguetes;
            }
            if (this.selectValue == "Mayor Precio") {
                this.farmaciaFiltrados.sort((a, b) => {
                    return b.precio - a.precio;
                });
                this.juguetesFiltrados.sort((a, b) => {
                    return b.precio - a.precio;
                })
            } else if (this.selectValue == "Menor Precio") {
                this.farmaciaFiltrados.sort((a, b) => {
                    return a.precio - b.precio;
                });
                this.juguetesFiltrados.sort((a, b) => {
                    return a.precio - b.precio;
                })
            }
        },//filtro

        cambioContador() {
            localStorage.setItem('productosEnElCarrito', JSON.stringify(this.arrayCarritoDeCompras))
        },//actualiza el array carrito de compras si se toca el stepper

        cantidadTotalEnCarrito() {
            this.cantTotalCarro = 0
            this.arrayCarritoDeCompras.forEach(producto => {
                this.cantTotalCarro += producto.contador
            })
        }//calcula la cantidad total de los productos en el carro y la guarda en una variable
    }

}).mount('#app')




