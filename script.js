/* =====================================================
   CINEVERSE - TMDB MOVIE WEBSITE
   ===================================================== */


/* =====================================================
   TMDB CONFIGURATION
   ===================================================== */

const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmNTE2Y2MyZmFmNTRkZDkxMzFmOGRmZWMwYmFhNTZlOCIsIm5iZiI6MTc4ODM3MjUwNi4yNTgsInN1YiI6IjZhOTg2NjFhZDRhNTkzOWM1NTllNmU0YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.OJ7s8R8WlE10zvL10s0HmRYcO8GYNThk2qbO36kzJrQ";

const API_BASE_URL = "https://api.themoviedb.org/3";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";

const API_OPTIONS = {

    method: "GET",

    headers: {
        accept: "application/json",
        Authorization: `Bearer ${TMDB_TOKEN}`
    }

};


/* =====================================================
   DOM ELEMENTS
   ===================================================== */

const loadingScreen =
    document.getElementById("loadingScreen");

const toast =
    document.getElementById("toast");

const searchInput =
    document.getElementById("searchInput");

const searchBtn =
    document.getElementById("searchBtn");

const searchSection =
    document.getElementById("searchSection");

const searchResults =
    document.getElementById("searchResults");

const searchTitle =
    document.getElementById("searchTitle");

const trendingMovies =
    document.getElementById("trendingMovies");

const popularMovies =
    document.getElementById("popularMovies");

const topRatedMovies =
    document.getElementById("topRatedMovies");

const genreSection =
    document.getElementById("genreSection");

const genreResults =
    document.getElementById("genreResults");

const genreTitle =
    document.getElementById("genreTitle");

const favoriteMovies =
    document.getElementById("favoriteMovies");

const movieModal =
    document.getElementById("movieModal");

const modalBody =
    document.getElementById("modalBody");

const closeModal =
    document.getElementById("closeModal");

const modalOverlay =
    document.getElementById("modalOverlay");

const mobileMenuBtn =
    document.getElementById("mobileMenuBtn");

const mobileMenu =
    document.getElementById("mobileMenu");


/* =====================================================
   GENRE NAMES
   ===================================================== */

const genreNames = {

    28: "Action",
    35: "Comedy",
    27: "Horror",
    878: "Sci-Fi",
    18: "Drama",
    10749: "Romance",
    53: "Thriller",
    14: "Fantasy"

};


/* =====================================================
   APP STATE
   ===================================================== */

let favorites =
    JSON.parse(localStorage.getItem("cineverseFavorites")) || [];


/* =====================================================
   API REQUEST
   ===================================================== */

async function fetchMovies(endpoint) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}${endpoint}`,
                API_OPTIONS
            );

        if (!response.ok) {

            throw new Error(
                `TMDB Error: ${response.status}`
            );

        }

        return await response.json();

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to connect to TMDB."
        );

        return {
            results: []
        };

    }

}


/* =====================================================
   IMAGE HELPER
   ===================================================== */

function getImage(path, size = "w500") {

    if (!path) {

        return "https://via.placeholder.com/500x750/151515/ffffff?text=No+Poster";

    }

    return `${IMAGE_BASE_URL}${size}${path}`;

}


/* =====================================================
   ESCAPE HTML
   ===================================================== */

function escapeHTML(text) {

    if (!text) return "";

    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =====================================================
   MOVIE CARD
   ===================================================== */

function createMovieCard(movie) {

    const isFavorite =
        favorites.includes(movie.id);

    const title =
        escapeHTML(
            movie.title ||
            movie.name ||
            "Unknown Movie"
        );

    const description =
        escapeHTML(
            movie.overview ||
            "No description available."
        );

    const releaseDate =
        movie.release_date ||
        movie.first_air_date ||
        "";

    const year =
        releaseDate
            ? releaseDate.substring(0, 4)
            : "N/A";

    const rating =
        movie.vote_average
            ? movie.vote_average.toFixed(1)
            : "N/A";


    return `

        <article class="movie-card">

            <div class="movie-poster-wrapper">

                <img
                    class="movie-poster"
                    src="${getImage(movie.poster_path)}"
                    alt="${title}"
                    loading="lazy"
                >

                <div class="poster-gradient"></div>

                <div class="rating">
                    ★ ${rating}
                </div>

                <button
                    class="favorite-btn ${isFavorite ? "active" : ""}"
                    onclick="toggleFavorite(${movie.id})"
                    aria-label="Add to favorites"
                >
                    ${isFavorite ? "♥" : "♡"}
                </button>

            </div>

            <div class="movie-info">

                <h3 class="movie-title">
                    ${title}
                </h3>

                <div class="movie-meta">

                    <span>${year}</span>

                    <span>•</span>

                    <span>
                        Movie
                    </span>

                </div>

                <p class="movie-description">
                    ${description}
                </p>

                <button
                    class="details-btn"
                    onclick="openMovieDetails(${movie.id})"
                >
                    View Details
                </button>

            </div>

        </article>

    `;

}


/* =====================================================
   RENDER MOVIES
   ===================================================== */

function renderMovies(container, movies) {

    if (!movies || movies.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>No movies found</h3>

                <p>
                    Try searching for another movie.
                </p>

            </div>

        `;

        return;

    }

    container.innerHTML =
        movies
            .map(movie => createMovieCard(movie))
            .join("");

}


/* =====================================================
   LOAD TRENDING
   ===================================================== */

async function loadTrending() {

    const data =
        await fetchMovies(
            "/trending/movie/week?language=en-US"
        );

    renderMovies(
        trendingMovies,
        data.results.slice(0, 10)
    );

}


/* =====================================================
   LOAD POPULAR
   ===================================================== */

async function loadPopular() {

    const data =
        await fetchMovies(
            "/movie/popular?language=en-US&page=1"
        );

    renderMovies(
        popularMovies,
        data.results.slice(0, 10)
    );

}


/* =====================================================
   LOAD TOP RATED
   ===================================================== */

async function loadTopRated() {

    const data =
        await fetchMovies(
            "/movie/top_rated?language=en-US&page=1"
        );

    renderMovies(
        topRatedMovies,
        data.results.slice(0, 10)
    );

}


/* =====================================================
   SEARCH MOVIES
   ===================================================== */

async function searchMovies(query) {

    query = query.trim();

    if (!query) {

        showToast(
            "Please enter a movie name."
        );

        return;

    }

    showLoading();

    const data =
        await fetchMovies(
            `/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`
        );

    searchSection.classList.add("show");

    searchTitle.textContent =
        `Results for "${query}"`;

    renderMovies(
        searchResults,
        data.results
    );

    hideLoading();

    searchSection.scrollIntoView({
        behavior: "smooth"
    });

}


/* =====================================================
   SEARCH BUTTON
   ===================================================== */

searchBtn.addEventListener(
    "click",
    () => {

        searchMovies(
            searchInput.value
        );

    }
);


/* =====================================================
   ENTER KEY SEARCH
   ===================================================== */

searchInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            searchMovies(
                searchInput.value
            );

        }

    }
);


/* =====================================================
   QUICK SEARCH BUTTONS
   ===================================================== */

document.querySelectorAll(
    ".quick-search"
).forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const query =
                button.dataset.search;

            searchInput.value = query;

            searchMovies(query);

        }
    );

});


/* =====================================================
   GENRE SEARCH
   ===================================================== */

document.querySelectorAll(
    ".genre-card"
).forEach(button => {

    button.addEventListener(
        "click",
        async () => {

            const genreID =
                button.dataset.genre;

            const genreName =
                genreNames[genreID] ||
                "Movies";

            await loadGenre(
                genreID,
                genreName
            );

        }
    );

});


async function loadGenre(
    genreID,
    genreName
) {

    showLoading();

    const data =
        await fetchMovies(
            `/discover/movie?with_genres=${genreID}&language=en-US&sort_by=popularity.desc&page=1`
        );

    genreTitle.textContent =
        `${genreName} Movies`;

    genreSection.classList.add("show");

    renderMovies(
        genreResults,
        data.results
    );

    hideLoading();

    genreSection.scrollIntoView({
        behavior: "smooth"
    });

}


/* =====================================================
   FAVORITES
   ===================================================== */

function toggleFavorite(movieID) {

    if (favorites.includes(movieID)) {

        favorites =
            favorites.filter(
                id => id !== movieID
            );

        showToast(
            "Removed from favorites."
        );

    } else {

        favorites.push(movieID);

        showToast(
            "Added to favorites ❤️"
        );

    }

    localStorage.setItem(
        "cineverseFavorites",
        JSON.stringify(favorites)
    );

    loadFavorites();

    refreshVisibleMovies();

}


/* =====================================================
   LOAD FAVORITES
   ===================================================== */

async function loadFavorites() {

    if (favorites.length === 0) {

        favoriteMovies.innerHTML = `

            <div class="empty-state">

                <h3>Your favorites are empty</h3>

                <p>
                    Click the ♡ button on a movie
                    to save it here.
                </p>

            </div>

        `;

        return;

    }

    const moviePromises =
        favorites.map(
            id =>
                fetchMovies(
                    `/movie/${id}?language=en-US`
                )
        );

    const movies =
        await Promise.all(
            moviePromises
        );

    renderMovies(
        favoriteMovies,
        movies.filter(movie => movie.id)
    );

}


/* =====================================================
   REFRESH MOVIE SECTIONS
   ===================================================== */

async function refreshVisibleMovies() {

    const sections = [

        {
            endpoint:
                "/trending/movie/week?language=en-US",

            container:
                trendingMovies
        },

        {
            endpoint:
                "/movie/popular?language=en-US&page=1",

            container:
                popularMovies
        },

        {
            endpoint:
                "/movie/top_rated?language=en-US&page=1",

            container:
                topRatedMovies
        }

    ];

    for (const section of sections) {

        const data =
            await fetchMovies(
                section.endpoint
            );

        renderMovies(
            section.container,
            data.results.slice(0, 10)
        );

    }

}


/* =====================================================
   MOVIE DETAILS
   ===================================================== */

async function openMovieDetails(movieID) {

    showLoading();

    const movie =
        await fetchMovies(
            `/movie/${movieID}?language=en-US&append_to_response=videos,credits,similar`
        );

    hideLoading();

    if (!movie.id) {

        showToast(
            "Could not load movie details."
        );

        return;

    }

    const title =
        escapeHTML(movie.title);

    const overview =
        escapeHTML(
            movie.overview ||
            "No description available."
        );

    const tagline =
        escapeHTML(
            movie.tagline || ""
        );

    const year =
        movie.release_date
            ? movie.release_date.substring(0, 4)
            : "N/A";

    const runtime =
        movie.runtime
            ? `${movie.runtime} min`
            : "N/A";

    const rating =
        movie.vote_average
            ? movie.vote_average.toFixed(1)
            : "N/A";


    const favorite =
        favorites.includes(movie.id);


    /* Find YouTube trailer */

    const trailer =
        movie.videos?.results?.find(
            video =>
                video.site === "YouTube" &&
                video.type === "Trailer"
        );


    /* Cast */

    const cast =
        movie.credits?.cast?.slice(0, 8) || [];


    modalBody.innerHTML = `

        <div
            class="modal-hero"
            style="
                background-image:
                url('${getImage(
                    movie.backdrop_path,
                    "original"
                )}');
            "
        >

            <div class="modal-info">

                <h2>
                    ${title}
                </h2>

                <p class="modal-tagline">
                    ${tagline}
                </p>

                <div class="modal-meta">

                    <span>
                        ★ ${rating}
                    </span>

                    <span>
                        ${year}
                    </span>

                    <span>
                        ${runtime}
                    </span>

                    <span>
                        ${movie.status || ""}
                    </span>

                </div>

                <p class="modal-description">
                    ${overview}
                </p>

                <div class="modal-actions">

                    <button
                        onclick="toggleFavorite(${movie.id})"
                    >
                        ${favorite
                            ? "♥ Remove Favorite"
                            : "♡ Add Favorite"
                        }
                    </button>

                    ${
                        trailer
                        ?
                        `
                        <button
                            onclick="
                                document
                                .getElementById('trailer')
                                .scrollIntoView({
                                    behavior:'smooth'
                                })
                            "
                        >
                            ▶ Watch Trailer
                        </button>
                        `
                        :
                        ""
                    }

                </div>

            </div>

        </div>


        <section class="cast-section">

            <h3>Cast</h3>

            <div class="cast-grid">

                ${
                    cast.length
                    ?
                    cast.map(person => `

                        <div class="cast-card">

                            <img
                                src="${getImage(
                                    person.profile_path,
                                    "w185"
                                )}"
                                alt="${escapeHTML(
                                    person.name
                                )}"
                            >

                            <p>
                                ${escapeHTML(
                                    person.name
                                )}
                            </p>

                        </div>

                    `).join("")
                    :
                    "<p>No cast information available.</p>"
                }

            </div>

        </section>


        ${
            trailer
            ?
            `

            <section
                class="trailer-wrapper"
                id="trailer"
            >

                <h3 style="margin-bottom:15px;">
                    Official Trailer
                </h3>

                <iframe
                    src="https://www.youtube.com/embed/${trailer.key}"
                    title="${title} trailer"
                    allowfullscreen
                ></iframe>

            </section>

            `
            :
            ""
        }

    `;


    movieModal.classList.add("active");

    document.body.classList.add(
        "modal-open"
    );

}


/* =====================================================
   CLOSE MODAL
   ===================================================== */

function closeMovieModal() {

    movieModal.classList.remove(
        "active"
    );

    document.body.classList.remove(
        "modal-open"
    );

    modalBody.innerHTML = "";

}


closeModal.addEventListener(
    "click",
    closeMovieModal
);

modalOverlay.addEventListener(
    "click",
    closeMovieModal
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            movieModal.classList.contains("active")
        ) {

            closeMovieModal();

        }

    }
);


/* =====================================================
   MOBILE MENU
   ===================================================== */

mobileMenuBtn.addEventListener(
    "click",
    () => {

        mobileMenu.classList.toggle(
            "active"
        );

    }
);


document.querySelectorAll(
    ".mobile-menu a"
).forEach(link => {

    link.addEventListener(
        "click",
        () => {

            mobileMenu.classList.remove(
                "active"
            );

        }
    );

});


/* =====================================================
   NEWSLETTER
   ===================================================== */

document.getElementById(
    "newsletterForm"
).addEventListener(
    "submit",
    event => {

        event.preventDefault();

        const email =
            document.getElementById(
                "emailInput"
            ).value;

        if (!email) return;

        showToast(
            "You're subscribed! 🎬"
        );

        event.target.reset();

    }
);


/* =====================================================
   TOAST
   ===================================================== */

let toastTimeout;

function showToast(message) {

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        toastTimeout
    );

    toastTimeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =====================================================
   LOADING
   ===================================================== */

function showLoading() {

    loadingScreen.classList.remove(
        "hidden"
    );

}


function hideLoading() {

    loadingScreen.classList.add(
        "hidden"
    );

}


/* =====================================================
   VIEW ALL TRENDING
   ===================================================== */

document.getElementById(
    "trendingViewAll"
).addEventListener(
    "click",
    async () => {

        showLoading();

        const data =
            await fetchMovies(
                "/trending/movie/week?language=en-US"
            );

        renderMovies(
            trendingMovies,
            data.results
        );

        hideLoading();

    }
);


/* =====================================================
   INITIALIZE WEBSITE
   ===================================================== */

async function initializeApp() {

    showLoading();

    await Promise.all([

        loadTrending(),

        loadPopular(),

        loadTopRated(),

        loadFavorites()

    ]);

    hideLoading();

}


/* =====================================================
   START APP
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);