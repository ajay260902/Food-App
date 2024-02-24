document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const mealList = document.getElementById('mealList');
    const modalContainer = document.querySelector('.modal-container');
    const mealDetailsContent = document.querySelector('.meal-details-content');
    const recipeCloseBtn = document.getElementById('recipeCloseBtn');
    const totalResult = document.getElementById('totalResults');
    const baseUrl = 'https://spoonacular.com/recipeImages/';
    const apiKey = '9c72132df581487f8f2426bb5b2803f8'
    let currentPage = 1;
    let currentQuery = '';

    const filterButton = document.getElementById('filterButton');
    const filterDropdown = document.getElementById('filterDropdown');




    // Event listeners
    searchButton.addEventListener('click', async () => {
        const ingredient = searchInput.value.trim();
        if (ingredient) {
            currentQuery = ingredient;
            currentPage = 1; // Reset current page when performing a new search
            await performSearch(currentQuery, currentPage);
        }
    });

    // Event listener for previous button
    document.getElementById('prevBtn').addEventListener('click', async () => {
        if (currentPage > 1) {
            currentPage--;
            await performSearch(currentQuery, currentPage);
        }
    });

    // Event listener for next button
    document.getElementById('nextBtn').addEventListener('click', async () => {
        currentPage++;
        await performSearch(currentQuery, currentPage);
    });

    // Function to perform search with pagination
    async function performSearch(ingredient, page, filter) {
        try {
            let url = `https://api.spoonacular.com/recipes/search?apiKey=${apiKey}&query=${ingredient}&number=10&offset=${(page - 1) * 10}`;

            // If filter is provided, add it to the URL
            if (filter) {
                url += `&cuisine=${filter}`;
            }

            const response = await fetch(url);
            const data = await response.json();
            console.log(data);
            displayMeals(data.results);
            updatePaginationUI(data.totalResults);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }


    filterButton.addEventListener('click', async () => {
        const selectedFilter = filterDropdown.value;
        await performSearch(currentQuery, currentPage, selectedFilter);
    });

    // Function to fetch meal details by ID
    async function getMealDetails(mealId) {
        try {
            const response = await fetch(`https://api.spoonacular.com/recipes/${mealId}/information?apiKey=${apiKey}`);
            const data = await response.json();
            return data; // Return the meal details
        } catch (error) {
            console.error('Error fetching meal details:', error);
        }
    }


    // Function to display meals in the list
    // Function to display meals in the list
    function displayMeals(meals) {
        mealList.innerHTML = '';
        if (meals) {
            meals.forEach((meal) => {
                const mealItem = document.createElement('div');
                mealItem.classList.add('meal-item');
                mealItem.dataset.id = meal.id;
                mealItem.innerHTML = `
                <img src="${baseUrl}${meal.image}" alt="${meal.title}">
                <h3>${meal.title}</h3>
                <p>Ready in ${meal.readyInMinutes} minutes</p>
                <p>Servings: ${meal.servings}</p>
                <button class="view-details-btn">View Details</button>
            `;
                mealList.appendChild(mealItem);

                mealItem.querySelector('.view-details-btn').addEventListener('click', async () => {
                    const mealDetails = await getMealDetails(meal.id);
                    if (mealDetails) {
                        showMealDetailsPopup(mealDetails);
                    }
                });
            });
        } else {
            mealList.innerHTML = '<p>No meals found. Try another ingredient.</p>';
        }
    }

    // Event listener for meal items
    mealList.addEventListener('click', async (e) => {
        const card = e.target.closest('.meal-item');
        if (card) {
            const mealId = card.dataset.id;
            const meal = await getMealDetails(mealId);
            if (meal) {
                showMealDetailsPopup(meal); // Call the function here
            } else {
                console.error('Meal details not found for meal ID:', mealId);
            }
        }
    });


    // Function to update pagination UI
    function updatePaginationUI(totalResults) {
        totalResult.textContent = `Total results: ${totalResults}`;
        document.getElementById('currentPage').textContent = currentPage;
        document.getElementById('prevBtn').disabled = currentPage === 1;
        document.getElementById('nextBtn').disabled = (currentPage * 10) >= totalResults;
    }


    // Function to create and display meal details on popup
    async function showMealDetailsPopup(meal) {
        // Display loader while the image is loading
        mealDetailsContent.innerHTML = '<div class="loader"></div>';

        // Fetch the image
        const response = await fetch(`https://api.spoonacular.com/recipes/${meal.id}/card?apiKey=${apiKey}`);
        const data = await response.json();

        // Create image element
        const imgElement = new Image();
        imgElement.src = data.url;
        imgElement.alt = meal.title;
        imgElement.classList.add('meal-image');

        // Hide loader and append image when loaded
        imgElement.onload = () => {
            mealDetailsContent.innerHTML = '';
            mealDetailsContent.appendChild(imgElement);
        };

        // Show modal
        modalContainer.style.display = 'block';
    }

    // Event listener for popup close button
    recipeCloseBtn.addEventListener('click', closeRecipeModal);

    function closeRecipeModal() {
        modalContainer.style.display = 'none';
    }

    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            const ingredient = searchInput.value.trim();
            if (ingredient) {
                currentQuery = ingredient;
                currentPage = 1; // Reset current page when performing a new search
                performSearch(currentQuery, currentPage);
            }
        }
    });

    // Perform a default search on page load
    const defaultIngredient = 'bread';
    searchInput.value = defaultIngredient;
    currentQuery = defaultIngredient;
    performSearch(currentQuery, currentPage);
});
