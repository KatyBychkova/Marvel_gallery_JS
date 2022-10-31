import { filmsMock } from "./filmsMock.js";

const ALL_FILMS = "all_films";
const FAVOURITE_FILMS = "favorite_films";

// Инициализация localStorage
if (!fromStorage(ALL_FILMS) && !fromStorage(FAVOURITE_FILMS)) {
  toStorage(ALL_FILMS, filmsMock);
  toStorage(FAVOURITE_FILMS, []);
}

// Отображаем список фильмов
const storagedFilms = fromStorage(ALL_FILMS);
renderFilmsList(storagedFilms, ALL_FILMS);

//Логика переключения разделов Все/Избранное
const favouriteFilmsBtn = document.querySelector(".film-cards-container__favourite-films");
favouriteFilmsBtn.addEventListener("click", () => handleFilmsListSwitch(favouriteFilmsBtn));

//==========================================================

function toStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function fromStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}

// Функция рендера списка
function renderFilmsList(filmsList, listType) {
  const favouriteFilmsBtnHTML = document.querySelector(".film-cards-container__favourite-films");
  favouriteFilmsBtnHTML.insertAdjacentHTML("afterend", `<div id="${listType}" class="film-cards-container"></div>`);
  const filmsContainer = document.querySelector(".film-cards-container");

  // Выводим список фильмов
  if (filmsList.length) {
    filmsList.forEach((film) => renderFilmCard(film, filmsContainer));
  } else {
    filmsContainer.innerHTML = "<div>Список пуст</div>";
  }

  // Слушатели кнопки избранного
  const likeBtns = document.querySelectorAll(".film-card__button");
  likeBtns.forEach((btn, index) => btn.addEventListener("click", () => handleLikeBtnClick(filmsList, listType, index)));

  // Слушатели открытия/закрытия модального окна
  const filmTitles = document.querySelectorAll(".film-card__title");
  filmTitles.forEach((title, index) =>
    title.addEventListener("click", () => {
      const clickedFilm = filmsList[index];
      renderFilmModal(clickedFilm, filmsContainer);

      const closeModalBtn = document.querySelector(".close-modal");
      closeModalBtn.addEventListener(
        "click",
        () => {
          const modal = document.querySelector(".modal");
          modal.remove();
        },
        { once: true }
      );
    })
  );
}

// Функция отрисовки карточки списка
function renderFilmCard(film, targetContainer) {
  const { imgUrl, movieName, releaseYear, isFavourite } = film;
  const btnImg = isFavourite ? "favourite.png" : "notFavourite.png";
  targetContainer.insertAdjacentHTML(
    "beforeend",
    `<div  class="film-card">
  <img class="film-card__poster" src="${imgUrl}" />
  <div class="film-card__title">${movieName}</div>
  <div class="film-card__year">${releaseYear}</div>
  <button class="film-card__button">
    <img class="film-card__button-img" src="./images/${btnImg}" />
  </button>
  <div>`
  );
}

function renderFilmModal(clickedFilm, targetContainer) {
  const { imgUrl, movieName, releaseYear, isFavourite, description } = clickedFilm;
  const btnImg = isFavourite ? "favourite.png" : "notFavourite.png";

  targetContainer.insertAdjacentHTML(
    "afterend",
    `<div class="modal">
    <div class="modal-content">
      <div class="close-modal">
        <img class="close-modal-icon" src="./images/cross.png" />
      </div>
      <img class="film-card__poster" src="${imgUrl}" />
      <div class="film-card__title">${movieName}</div>
      <div class="film-card__year">${releaseYear}</div>
      <div class="film-card__description">${description}</div>
      <button class="film-card__button">
        <img class="film-card__button-img" src="./images/${btnImg}" />
      </button>
    </div>
  </div>`
  );
}

// Функция-обработчик для кнопки добавления в избранное
function handleLikeBtnClick(filmsList, listType, index) {
  filmsList[index].isFavourite = !filmsList[index].isFavourite;

  const sortedFilmsList = sortByIsFavourite(filmsList);
  const sortedFavouriteFilmsList = sortFavouriteFilms(sortedFilmsList);
  const filmsListContainer = document.getElementById(listType);

  switch (listType) {
    case ALL_FILMS:
      toStorage(ALL_FILMS, sortedFilmsList);
      toStorage(FAVOURITE_FILMS, sortedFavouriteFilmsList);
      filmsListContainer.remove();
      renderFilmsList(sortedFilmsList, listType);
      return;
    case FAVOURITE_FILMS:
      const newAllFilmsList = fromStorage(ALL_FILMS);
      newAllFilmsList[index].isFavourite = !newAllFilmsList[index].isFavourite;
      toStorage(ALL_FILMS, sortByIsFavourite(newAllFilmsList));
      toStorage(FAVOURITE_FILMS, sortedFavouriteFilmsList);
      filmsListContainer.remove();
      renderFilmsList(sortedFavouriteFilmsList, listType);
      return;
    default:
      return;
  }
}

// Функции сортировки
function sortByIsFavourite(items) {
  return items.sort((a, b) => a.id - b.id).sort((a) => (a.isFavourite ? -1 : 1));
}
function sortFavouriteFilms(items) {
  return items.filter((item) => item.isFavourite).sort((a, b) => b.id - a.id);
}

// Переключатель списков
function handleFilmsListSwitch(switcherBtn) {
  const filmsContainer = document.querySelector(".film-cards-container");
  const filmsCardContainerTitle = document.querySelector(".film-cards-container__title");

  switch (filmsContainer.id) {
    case ALL_FILMS:
      filmsContainer.remove();
      filmsCardContainerTitle.innerHTML = "Favourite Films";
      switcherBtn.innerHTML = "See All Films";
      renderFilmsList(fromStorage(FAVOURITE_FILMS), FAVOURITE_FILMS);
      return;
    case FAVOURITE_FILMS:
      filmsContainer.remove();
      filmsCardContainerTitle.innerHTML = " All Films";
      switcherBtn.innerHTML = "See  Favourite Films";
      renderFilmsList(fromStorage(ALL_FILMS), ALL_FILMS);
      return;
    default:
      return;
  }
}
