// Evento de submit del form con id buscador
document.querySelector('#search').addEventListener('input', (e) => {
    search = e.target.value // Tomamos el valor del input donde se esta escribiendo
    filter() // Pasamos a filtrar las tareas que cumplan con lo buscado
})

// Evento change del select de estado
document.querySelector('#state').addEventListener('change', (e) => {
    // Si el value es "true" -> queda en verdadero (true)
    // Si el value es "false" -> queda en falso (false)
    // Si el value es "" -> queda en nulo (null)
    state = e.target.value == 'true' ? true : e.target.value == '' ? null : false
    filter() // Pasamos a filtrar las tareas que cumplan con lo buscado
})

// Evento de submit del form con id new
document.querySelector('#new').addEventListener('submit', (e) => {
    e.preventDefault(); // Hace que no se vaya a la url del action (tenga o no)
    const title = document.querySelector('#new-title') // Cargamos el titulo de la nueva tarea
    const description = document.querySelector('#new-description') // Cargamos la descripcion de la nueva tarea
    const newTask = { // Creamos un objeto (JSON)
        title: title.value.trim(), // Obtenemos el title de la tarea
        description: description.value.trim(), // Obtenemos el description de la tarea
        done: false // Estado de la tarea
    }
    title.value = '' // Limpiamos el input
    description.value = '' // Limpiamos el input
    title.classList.remove('is-valid') // Sacamos el estado de valido
    document.querySelector("#new-submit").disabled = true // Desactivamos el boton
    if(edit != -1){ // Si se esta editanto pasa lo de dentro
        tasks[edit] = newTask  // Guardamos los cambios
        document.querySelector('#new-submit').disabled = true // Desactivamos el boton de Guardar
        document.querySelector('#new-cancel').hidden = true // Escondemos el boton de cancelar
        edit = -1 // Desactivamos el modo editar
    }
    else tasks.push(newTask) // Agregamos la tarea al final
    show(tasks) // Mostramos las taareas
    save() // Guardamos los cambios
})

// Evento de submit del form con id new
document.querySelector('#new').addEventListener('reset', (e) => {
    e.preventDefault()
    const task = tasks[edit]
    const form = new FormData(e.target)
    if(
        (task.title == form.get('title') && task.description == form.get('description')) ||
        confirm("Esta seguro de que desea cancelar la edicion?")
    ){
        // Si el titulo es diferente al de la tarea que se esta editando o
        // la descripcion es diferente o si acepta el cancelar la edicion -> se borran los cambios
        edit = -1 // Desactivamos el modo editar
        document.querySelector('#new-submit').disabled = true // Desactivamos el boton de Guardar
        document.querySelector('#new-cancel').hidden = true // Escondemos el boton de cancelar
        document.querySelector('#new-title').classList.remove('is-valid') // Removemos el tick verde del titulo
        document.querySelector('#new-title').classList.remove('is-invalid') // Removemos el rojo del titulo
        document.querySelector('#new-title').value = '' // Reiniciamos el titulo de la tarea
        document.querySelector('#new-description').value = '' // Reiniciamos la descripcion de la tarea
    }
})

// Evento de escritura en el titulo de la nueva tarea
document.querySelector('#new-title').addEventListener('input', (e) => {
    var text = e.target.value
    if(!text){
        // Si no se ingreso titulo
        // Invalido
        e.target.classList.remove('is-invalid') // Reestablecemos el estado del titulo
        e.target.classList.remove('is-valid') // Reestablecemos el estado del titulo
        document.querySelector("#new-submit").disabled = true // Desactivamos el boton de Guardar
    }else if(tasks.find( (t, index) => t.title.toLowerCase() == text.toLowerCase() && index !=edit)){
        // Si existe una tarea que ya tiene ese nombre y, en el caso de estar editando, no es la q estamos editando
        // Invalido
        e.target.classList.add('is-invalid') // Ponemos en rojo el titulo
        e.target.classList.remove('is-valid') // Quitamos el verde del titulo
        document.querySelector("#new-submit").disabled = true // Desactivamos el boton de Guardar
    }else{
        // Si ingresamos un titulo y no existe una tarea q lo tenga, o la q lo tiene justo es la q estamos editando
        // Valido
        e.target.classList.add('is-valid')  // Ponemos en verde el titulo
        e.target.classList.remove('is-invalid') // Quitamos el rojo del titulo
        document.querySelector("#new-submit").disabled = false // Activamos el boton de Guardar
    }
})

// Espera a q haya un click y si ese es en una tarea -> cambia el estado de la misma o la elimina
document.addEventListener("click", (e) => {
    const target = e.target // Tomamos el elemento donde se hizo el click
    const mode = findData(target, "data-action") // Buscamos si el elemento, o sus padres, tiene el attributo buscado
    const index = Number.parseInt(findData(target, 'data-task')) // Buscamos si el elemento, o sus padres, tiene el attributo buscado
    switch(mode){
        case 'edit':
            // Permite la edicion de la tarea
            edit = index // Establecemos la edicion
            const task = tasks[index] // Cargamos la tarea a editar
            document.querySelector('#new-title').classList.add('is-valid') // Establecemos en verde el titulo
            document.querySelector('#new-title').value = task.title // Seteamos el titulo en el input asi editamos
            document.querySelector('#new-description').value = task.description // Seteamos la descripcion en el input asi editamos
            document.querySelector('#new-submit').disabled = false // Activamos el boton de guardar
            document.querySelector('#new-cancel').hidden = false // Mostramos el boton de cancelar
            break
        case 'delete':
            // Borra la tarea, si es q el usuario confirma la accion
            if(confirm('Esta seguro de que desea eliminar la tarea?')){
                tasks.splice(index, 1) // Elimina la tarea elegida
                filter() // Mostramos las tareas
                save() // Guardamos los cambios
            }
            break
        case 'state':
            // Cambia el estado de la tarea
            tasks[index].done =  !tasks[index].done // Cambiamos el estado de la tarea
            filter() // Muestra las tareas
            save() // Guardamos los cambios
            break
    }
})

// Da formato a la tarea
function format(task){
    const newTask = document.createElement("div") // Crea un elemento de tipo div
    newTask.setAttribute('data-task', tasks.indexOf(task)) // Establecemos el atributo data-task con el valor del indice en el array
    newTask.setAttribute('data-action', 'state') // Establecemos el atributo data-accion con la accion a realizar frente a un click (chiche nuestro)
    newTask.classList += `card clicky text-light border-light ${task.done ? 'bg-success' : 'bg-danger'}` // agrega la clase card a sus clases
    newTask.innerHTML = `
        <div class='card-header font-weight-bold  ${task.description ? 'border-light' : '' }'>
            ${task.title}
        </div>
        ${!task.description ? '' : 
            `<div class='card-body'>
                ${task.description}
            </div>`
        }
        <div class='card-footer border-light row mx-auto text-center p-0'>
            <button class='btn text-light font-weight-bold col' data-action='edit'><i class='fas fa-edit'></i></button>
            <button class='btn text-light font-weight-bold col' data-action='delete'><i class="fas fa-trash"></i></button>
        </div>
    ` // Establecemos el contenido de la tarjeta (card) creada
    return newTask
}

// Mustra en tasks lo q recibe
function show(array, search){
    const container = document.querySelector('#tasks') // Agarramos el div de tareas
    container.innerHTML = '' // Limpiamos su contenido
    if(array.length == 0){
        container.classList.remove('card-columns') // Quitamos la clase card-columns al mostrador de tareas
        var error = document.createElement("div") // Creamos un div para mostrar el mensaje
        error.innerHTML = search ? "No se encontraron tareas 😞" : "No hay tareas ¡Las hicimos todas!😄"  // Agregamos el mensaje al div, dependiendo el estado
        container.append(error) // Agregamos el mensaje al contenedor de tareas
        return // Cortamos la ejecucion para q no haga lo q sigue
    }
    if(!container.classList.contains('card-columns')) container.classList.add('card-columns') // Agregamos la clase card-columns al mostrador de tareas
    array.forEach((tarea) => { // Para cada tarea en el array de tareas hacer lo q este entre {}
        container.append(format(tarea)) // Agregamos la tarea al mostrador de tareas (se ejecuta 1 vez por cada tarea)
    })
}

// Filtra las tareas para mostrar las que cumplan con lo pedido
function filter(){
    show(tasks.filter((t) =>
        // Si la tarea cumple alguna de las condiciones -> la deja
        // Si existe un estado esperado -> filtra por estado
        // Si existe un texto buscado -> filtra por texto
        // Si existen ambos -> busca los textos del estado
        (state == null || t.done == state) &&
        (!search || t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()))
    ), search || state != null)
}

// Busca el atributo solicitado en el elemento o sus padres
function findData(element, attr){
    return element.tagName == 'BODY' ? null : element.hasAttribute(attr) ? element.getAttribute(attr) : findData(element.parentElement, attr)
}

// Guarda en memoria local las tareas
function save(){
    localStorage.setItem('tasks', JSON.stringify(tasks))
}

// Carga de la memoria local las tareas
function load(){
    return localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : []
}

// Aca vamos a guardar las tareas del usuario
const tasks = load()

// Los usamos para el filtro
var search = '' // Texto buscado en el filtro
var state = null // Estado buscado en el filtro

// Lo usamos para la edicion
var edit = -1 // -1 -> no se edita nada | cualquier otro numero -> se esta editando una tarea

// Muestra por primera vez las tareas
show(tasks)