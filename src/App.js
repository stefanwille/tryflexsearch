import React, { useState, useEffect } from 'react';
import './App.css';
import FlexSearch from 'flexsearch';

import Articles from './styles.json';

const index = new FlexSearch({
	encode: 'balance',
	tokenize: 'forward',
	threshold: 0,
	async: false,
	worker: false,
	cache: false,
});

Articles.forEach((article) => {
	index.add(article.id, article.productDisplayName);
});

const Article = React.memo(function({ article, visible }) {
	return (
		<React.Fragment>
			<td>{article.id}</td>
			<td>{article.productDisplayName}</td>
			<td>{article.baseColour}</td>
		</React.Fragment>
	);
});

const hiddenStyle = { style: { display: 'none' } };

function App() {
	const [ searchText, setSearchText ] = useState('');
	const [ ids, setIds ] = useState({});
	const performSearch = () => {
		let searchResultIds;
		console.log('searchText', searchText, searchText.length);
		if (searchText === '') {
			searchResultIds = Articles.map((style) => style.id);
			console.log('performSearch: no search');
		} else {
			searchResultIds = index.search(searchText);
			console.log('performSearch got', searchResultIds.length);
		}
		const newIds = {};
		searchResultIds.forEach((id) => (newIds[id] = true));
		setIds(newIds);
	};

	useEffect(performSearch, []);

	return (
		<div className="App">
			<header className="App-header">
				<div>
					Search:{' '}
					<input
						type="text"
						value={searchText}
						onChange={(e) => {
							setSearchText(e.target.value);
							performSearch();
						}}
					/>
				</div>
				<table>
					<tbody>
						{Articles.map((article) => {
							return (
								<tr key={article.id} {...ids[article.id] || hiddenStyle}>
									<Article key={article.id} article={article} />
								</tr>
							);
						})}
					</tbody>
				</table>
			</header>
		</div>
	);
}

export default App;
