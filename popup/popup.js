// les aides
const $ = (s) => { return document.querySelector(s) };
const $$ = (s) => { return document.querySelectorAll(s) };

// les fonctions
const changeCatégorie = (cat) => {
	$$('#kategoriler .kategori').forEach((el) => { el.classList.remove('seçili'); });
	$$('#kategoriler .kategori_' + cat).forEach((el) => { el.classList.add('seçili'); });

	$$('#alt-kategoriler .kategori').forEach((el) => { el.style.display = 'none'; });
	$$('#alt-kategoriler .kategori_' + cat).forEach((el) => { el.style.display = 'inline-block'; });

	changeSousCatégorie($('#alt-kategoriler .kategori_' + cat).innerText);

	browser.storage.local.set({'catégorieChoisie': cat});
}

const changeSousCatégorie = (cat) => {
	$$('#alt-kategoriler .kategori').forEach((el) => { el.classList.remove('seçili'); });
	$('#alt-kategoriler #alt-kategori_' + cat).classList.add('seçili');

	$$('.kaomoji').forEach((el) => { el.style.display = 'none'; });
	$$('.kaomoji.alt-kategori_' + cat).forEach((el) => { el.style.display = 'inline-block'; });

	browser.storage.local.set({'sousCatégorieChoisie': cat});
}

// les charger tout
Object.keys(KAOMOJIS).forEach((cat, i) => {
	// les catégories
	let el = document.createElement('div');
	el.classList.add('kategori');
	el.classList.add('kategori_' + cat);
	if(i === 0) el.classList.add('seçili');
	el.innerText = cat;
	el.onclick = (e) => { changeCatégorie(e.target.innerText) };

	$('#kategoriler').appendChild(el);

	// les sous-catégories
	Object.keys(KAOMOJIS[cat]).forEach((sous, ii) => {
		let el = document.createElement('div');
		el.id = 'alt-kategori_' + sous;
		el.classList.add('kategori');
		el.classList.add('kategori_' + cat);
		if(ii === 0) el.classList.add('seçili');
		if(i !== 0) el.style.display = 'none';
		el.innerText = sous;
		el.onclick = (e) => { changeSousCatégorie(e.target.innerText) };

		$('#alt-kategoriler').appendChild(el);

		// les kaomojis
		KAOMOJIS[cat][sous].forEach((moji) => {
			let el = document.createElement('div');
			el.classList.add('kaomoji');
			el.classList.add('alt-kategori_' + sous);
			el.innerText = moji;
			el.setAttribute('data-clipboard-text', moji);
			if(i !== 0 || ii !== 0) el.style.display = 'none';

			$('#kaomojiler').appendChild(el);
		});
	});
});

// initiation du clipboard.js
new Clipboard('.kaomoji');

// restaurer la dernière catégorie choisie
browser.storage.local.get(['catégorieChoisie', 'sousCatégorieChoisie']).then(
	(val) => {
		if(typeof val.catégorieChoisie === 'string'){
			changeCatégorie(val.catégorieChoisie);
			changeSousCatégorie(val.sousCatégorieChoisie);
		}
	}
);
