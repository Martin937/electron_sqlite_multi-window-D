console.log('Dashboard page loaded');

document.addEventListener('DOMContentLoaded', () => {
	console.log('DOM fully loaded and parsed');

	// Безопасный доступ к API
	const electronAPI = window.electronAPI || {
		invoke: () => console.warn('Electron API not available'),
		on: () => { }
	};

	// Навигация
	document.querySelectorAll('.nav-btn').forEach(btn => {
		btn.addEventListener('click', () => {
			const page = btn.dataset.page;
			electronAPI.invoke('create-window', page).catch(console.error);
		});
	});

	// Темы
	electronAPI.on('theme-changed', (theme) => {
		document.documentElement.setAttribute('data-theme', theme);
	});

	// Заглушка для данных клиентов
	const clients = [
		{ id: 1, name: 'Иван Петров', lastVisit: '2023-10-15' },
		{ id: 2, name: 'Мария Сидорова', lastVisit: '2023-10-14' }
	];

	// Рендер списка клиентов
	const renderClients = () => {
		const container = document.querySelector('.client-list');
		container.innerHTML = clients.map(client => `
      <div class="client-card">
        <h3>${client.name}</h3>
        <p>Последний визит: ${client.lastVisit}</p>
      </div>
    `).join('');
	};

	renderClients();
});