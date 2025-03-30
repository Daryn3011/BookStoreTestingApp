document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const regionSelect = document.getElementById('regionSelect');
    const seedInput = document.getElementById('seedInput');
    const randomSeedBtn = document.getElementById('randomSeedBtn');
    const likesSlider = document.getElementById('likesSlider');
    const likesValue = document.getElementById('likesValue');
    const reviewsInput = document.getElementById('reviewsInput');
    const bookTableBody = document.getElementById('bookTableBody');
    const galleryView = document.getElementById('galleryView');
    const tableView = document.getElementById('tableView');
    const galleryViewSwitch = document.getElementById('galleryViewSwitch');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const exportBtn = document.getElementById('exportBtn');
    const bookDetailsModal = new bootstrap.Modal(document.getElementById('bookDetailsModal'));

    // State
    let currentPage = 1;
    let isLoading = false;
    let allBooks = [];
    let currentView = 'table';

    // Initialize
    updateLikesValue();
    loadBooks();

    // Event listeners
    regionSelect.addEventListener('change', resetAndLoadBooks);
    seedInput.addEventListener('change', resetAndLoadBooks);
    randomSeedBtn.addEventListener('click', generateRandomSeed);
    likesSlider.addEventListener('input', updateLikesValue);
    likesSlider.addEventListener('change', resetAndLoadBooks);
    reviewsInput.addEventListener('change', resetAndLoadBooks);
    galleryViewSwitch.addEventListener('change', toggleView);
    exportBtn.addEventListener('click', exportToCSV);

    // Infinite scroll
    window.addEventListener('scroll', function() {
        if (isLoading) return;

        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            currentPage++;
            loadBooks(false);
        }
    });

    // Functions
    function updateLikesValue() {
        likesValue.textContent = likesSlider.value;
    }

    function generateRandomSeed() {
        seedInput.value = Math.floor(Math.random() * 1000000);
        resetAndLoadBooks();
    }

    function resetAndLoadBooks() {
        currentPage = 1;
        allBooks = [];
        bookTableBody.innerHTML = '';
        galleryView.innerHTML = '';
        loadBooks();
    }

    function toggleView() {
        if (galleryViewSwitch.checked) {
            tableView.classList.add('d-none');
            galleryView.classList.remove('d-none');
            currentView = 'gallery';
            renderGalleryView();
        } else {
            tableView.classList.remove('d-none');
            galleryView.classList.add('d-none');
            currentView = 'table';
        }
    }

    function renderGalleryView() {
        galleryView.innerHTML = '';

        allBooks.forEach(book => {
            const col = document.createElement('div');
            col.className = 'col';

            const card = document.createElement('div');
            card.className = 'card book-card h-100';
            card.onclick = () => showBookDetails(book);

            card.innerHTML = `
                <img src="${book.coverImageUrl}" class="card-img-top book-cover" alt="${book.title}">
                <div class="card-body">
                    <h5 class="card-title">${book.title}</h5>
                    <p class="card-text text-muted">${book.author}</p>
                    <div class="d-flex justify-content-between">
                        <small class="text-muted">${book.publisher}</small>
                        <div>
                            <span class="badge bg-primary me-1">${book.likeCount} ♥</span>
                            <span class="badge bg-secondary">${book.reviewCount} ✎</span>
                        </div>
                    </div>
                </div>
            `;

            col.appendChild(card);
            galleryView.appendChild(col);
        });
    }

    async function loadBooks(reset = true) {
        isLoading = true;
        loadingSpinner.classList.remove('d-none');

        try {
            const region = regionSelect.value;
            const seed = parseInt(seedInput.value) || 0;
            const likes = parseFloat(likesSlider.value) || 0;
            const reviews = parseFloat(reviewsInput.value) || 0;

            const response = await fetch(`/api/books?region=${region}&seed=${seed}&likes=${likes}&reviews=${reviews}&page=${currentPage}`);
            const newBooks = await response.json();

            if (reset) {
                allBooks = newBooks;
            } else {
                allBooks = [...allBooks, ...newBooks];
            }

            renderTableView();
            if (currentView === 'gallery') {
                renderGalleryView();
            }
        } catch (error) {
            console.error('Error loading books:', error);
        } finally {
            isLoading = false;
            loadingSpinner.classList.add('d-none');
        }
    }

    function renderTableView() {
        if (currentPage === 1) {
            bookTableBody.innerHTML = '';
        }

        const startIndex = (currentPage - 1) * 20;
        const booksToRender = allBooks.slice(startIndex, startIndex + 20);

        booksToRender.forEach(book => {
            const row = document.createElement('tr');
            row.className = 'table-row-clickable';
            row.onclick = () => showBookDetails(book);

            row.innerHTML = `
                <td>${book.index}</td>
                <td>${book.isbn}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.publisher}</td>
                <td>${book.likeCount}</td>
                <td>${book.reviewCount}</td>
            `;

            bookTableBody.appendChild(row);
        });
    }

    function showBookDetails(book) {
        document.getElementById('bookDetailsTitle').textContent = `${book.title} by ${book.author}`;
        document.getElementById('bookDetailsIsbn').textContent = book.isbn;
        document.getElementById('bookDetailsPublisher').textContent = book.publisher;
        document.getElementById('bookDetailsLikes').textContent = book.likeCount;

        const coverImage = document.getElementById('bookCoverImage');
        coverImage.src = book.coverImageUrl;
        coverImage.alt = `${book.title} by ${book.author}`;

        const reviewsContainer = document.getElementById('bookReviews');
        reviewsContainer.innerHTML = '';

        if (book.reviews && book.reviews.length > 0) {
            book.reviews.forEach(review => {
                const reviewElement = document.createElement('div');
                reviewElement.className = 'list-group-item';
                reviewElement.innerHTML = `<p class="mb-1">${review}</p>`;
                reviewsContainer.appendChild(reviewElement);
            });
        } else {
            const noReviews = document.createElement('div');
            noReviews.className = 'list-group-item';
            noReviews.textContent = 'No reviews yet';
            reviewsContainer.appendChild(noReviews);
        }

        bookDetailsModal.show();
    }

    function exportToCSV() {
        try {
            // Format data with proper encoding
            const csvData = allBooks.map(book => ({
                Index: book.index,
                ISBN: book.isbn,
                Title: book.title,
                Author: book.author.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
                Publisher: book.publisher
            }));

            const csvOptions = {
                quotes: true,
                header: true,
                delimiter: ",",
                newline: "\r\n"
            };

            const csv = Papa.unparse(csvData, csvOptions);

            const BOM = "\uFEFF";
            const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `books_${regionSelect.value}_${seedInput.value}.csv`;
            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);

        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export CSV. Please try again.');
        }
    }
});