const menuToggle = document.querySelector('.menu-toggle');
const siteMenu = document.getElementById('site-menu');
const menuLabel = menuToggle && menuToggle.querySelector('.sr-only');

function setMenuState(isOpen) {
	if (!menuToggle || !siteMenu) return;
	menuToggle.setAttribute('aria-expanded', String(isOpen));
	siteMenu.hidden = !isOpen;
	if (menuLabel) menuLabel.textContent = isOpen ? 'Close menu' : 'Open menu';
}

if (menuToggle && siteMenu) {
	menuToggle.addEventListener('click', function () {
		setMenuState(menuToggle.getAttribute('aria-expanded') !== 'true');
	});

	siteMenu.querySelectorAll('a').forEach(function (link) {
		link.addEventListener('click', function () {
			setMenuState(false);
		});
	});

	document.addEventListener('keydown', function (event) {
		if (event.key === 'Escape') setMenuState(false);
	});
}
