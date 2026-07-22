const button = document.querySelector('.menu-toggle');
const navigation = document.querySelector('nav');
button.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  button.setAttribute('aria-expanded', open);
  button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  button.textContent = open ? '×' : '☰';
});
navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  navigation.classList.remove('open'); button.setAttribute('aria-expanded', 'false'); button.textContent = '☰';
}));
document.querySelector('#year').textContent = new Date().getFullYear();
