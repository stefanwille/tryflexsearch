import React, { useState, useEffect } from 'react';
import FlexSearch from 'flexsearch';
import debounce from 'lodash.debounce';
import { observable, decorate } from 'mobx';

import './App.css';
import Articles from './styles.json';

const index = new FlexSearch({
	encode: 'balance',
	tokenize: 'forward',
	threshold: 0,
	async: false,
	worker: false,
	cache: false,
});

const Article = React.memo(function({ article }) {
	return (
		<React.Fragment>
			<td>{article.id}</td>
			<td>{article.productDisplayName}</td>
			<td>{article.baseColour}</td>
		</React.Fragment>
	);
});

const hiddenStyle = { style: { display: 'none' } };

class ObservableArticle {
	constructor(article) {
		this.id = article.id;
		this.productDisplayName = article.productDisplayName;
	}
}

decorate(ObservableArticle, {
	id: observable,
	productDisplayName: observable,
});

let observableArticles;

const makeObservableArticles = () => {
	console.time('makeObservables');
	observableArticles = Articles.map((article) => {
		return new ObservableArticle(article);
	});
	console.timeEnd('makeObservables');
	console.log('Got', observableArticles.length, 'objects');
};

makeObservableArticles();

const indexArticles = () => {
	console.time('indexArticles');
	observableArticles.forEach((article) => {
		index.add(article.id, article.productDisplayName);
	});
	console.timeEnd('indexArticles');
};

indexArticles();

const performSearch = (searchText, setIds) => {
	let searchResultIds;
	console.time('search');
	if (searchText === '') {
		searchResultIds = Articles.map((style) => style.id);
		console.log('performSearch: no search');
	} else {
		searchResultIds = index.search(searchText);
		console.log('performSearch got', searchResultIds.length);
	}
	const newIds = {};
	searchResultIds.forEach((id) => (newIds[id] = true));
	console.timeEnd('search');
	setIds(newIds);
};

const debouncedPerformSearch = debounce(performSearch, 200, {});

function App() {
	const [ searchText, setSearchText ] = useState('');
	const [ ids, setIds ] = useState({});

	useEffect(() => debouncedPerformSearch('', setIds), []);

	return (
		<div className="App">
			<header className="App-header">
				<div>
					Search:{' '}
					<input
						type="text"
						value={searchText}
						onChange={(e) => {
							const newSearchText = e.target.value;
							setSearchText(newSearchText);
							debouncedPerformSearch(newSearchText, setIds);
						}}
					/>
				</div>
				<table>
					<tbody>
						{observableArticles.map((article) => {
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
