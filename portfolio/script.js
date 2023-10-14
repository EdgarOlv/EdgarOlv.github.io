// script.js

// Obtém os elementos relevantes
const cards = document.querySelectorAll('.card')
const modal = document.getElementById('modal')
const projectTitle = document.getElementById('project-title')
const projectDetails = document.getElementById('project-details')
const projectImages = document.getElementById('project-images')
const closeModal = document.querySelector('.close')

// Adiciona um ouvinte de evento a cada card
cards.forEach(card => {
  card.addEventListener('click', () => {
    const project = card.getAttribute('data-project')

    // Substitui os detalhes do projeto e imagens no modal com base no projeto selecionado
    projectTitle.textContent = card.querySelector('h2').textContent
    projectDetails.textContent = `Detalhes do projeto ${project}`
    // Adicione aqui as imagens relacionadas ao projeto no modal

    // Exibe o modal
    modal.style.display = 'block'
  })
})

// Fecha o modal ao clicar no botão "X"
closeModal.addEventListener('click', () => {
  modal.style.display = 'none'
})

// Fecha o modal se o usuário clicar fora dele
window.addEventListener('click', event => {
  if (event.target === modal) {
    modal.style.display = 'none'
  }
})
