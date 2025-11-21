import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Book } from './book';
import { BookApiClient } from './book-api-client.service';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-5xl">
      <!-- Back Button -->
      <button
        routerLink="/books"
        class="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        <span>Back to Books</span>
      </button>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center items-center py-20">
        <div class="animate-pulse flex flex-col items-center">
          <div
            class="h-16 w-16 rounded-full border-4 border-t-blue-700 border-r-blue-700 border-b-gray-200 border-l-gray-200 animate-spin"
          ></div>
          <p class="mt-4 text-gray-600">Loading book details...</p>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h2 class="text-xl font-semibold text-red-800 mb-2">{{ error }}</h2>
        <p class="text-red-600 mb-4">Please try searching for another book or return to the book list.</p>
        <button
          routerLink="/books"
          class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
        >
          Return to Books
        </button>
      </div>

      <!-- Book Details -->
      <div *ngIf="book && !loading && !error" class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Book Cover -->
        <div class="md:col-span-1">
          <div class="sticky top-8">
            <div class="bg-gray-100 rounded-lg overflow-hidden shadow-lg">
              <img
                *ngIf="book.cover"
                [src]="book.cover"
                [alt]="book.title"
                class="w-full h-auto object-contain"
              />
              <div
                *ngIf="!book.cover"
                class="w-full aspect-[3/4] flex items-center justify-center bg-gray-200"
              >
                <span class="text-gray-500 font-medium">No cover available</span>
              </div>
            </div>
            <div class="mt-4 p-4 bg-blue-50 rounded-lg">
              <p class="text-sm text-gray-600 font-medium">ISBN</p>
              <p class="text-lg font-mono text-blue-700 break-words">{{ book.isbn }}</p>
            </div>
          </div>
        </div>

        <!-- Book Information -->
        <div class="md:col-span-2">
          <article>
            <!-- Title & Subtitle -->
            <header class="mb-6">
              <h1 class="text-4xl font-bold text-gray-900 mb-2">{{ book.title }}</h1>
              <p *ngIf="book.subtitle" class="text-xl text-gray-600">{{ book.subtitle }}</p>
            </header>

            <!-- Author -->
            <div class="mb-6 pb-6 border-b border-gray-200">
              <p class="text-sm text-gray-500 font-medium uppercase tracking-wide">Author</p>
              <p class="text-lg text-blue-700 font-semibold">{{ book.author }}</p>
            </div>

            <!-- Metadata Grid -->
            <div class="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
              <div>
                <p class="text-sm text-gray-500 font-medium uppercase tracking-wide">Publisher</p>
                <p class="text-base text-gray-900">{{ book.publisher }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 font-medium uppercase tracking-wide">Pages</p>
                <p class="text-base text-gray-900">{{ book.numPages }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 font-medium uppercase tracking-wide">Price</p>
                <p class="text-base font-semibold text-green-600">{{ book.price }} €</p>
              </div>
              <div>
                <p class="text-sm text-gray-500 font-medium uppercase tracking-wide">User ID</p>
                <p class="text-base text-gray-900">{{ book.userId }}</p>
              </div>
            </div>

            <!-- Abstract Section -->
            <section>
              <h2 class="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              <div class="prose prose-sm max-w-none">
                <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{{ book.abstract }}</p>
              </div>
            </section>
          </article>
        </div>
      </div>
    </div>
  `
})
export class BookDetailComponent implements OnInit {
  book: Book | null = null;
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private bookApiClient: BookApiClient
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const isbn = params.get('isbn');
      if (isbn) {
        this.loadBookDetails(isbn);
      } else {
        this.error = 'Invalid ISBN provided';
        this.loading = false;
      }
    });
  }

  private loadBookDetails(isbn: string): void {
    this.loading = true;
    this.error = null;
    this.book = null;

    this.bookApiClient.getSingleBook(isbn).subscribe({
      next: (book: Book) => {
        this.book = book;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error fetching book details:', err);
        if (err.status === 404) {
          this.error = 'Book not found';
        } else if (err.status === 0) {
          this.error = 'Network error. Please check if the API server is running on http://localhost:4730';
        } else {
          this.error = 'Failed to load book details. Please try again later.';
        }
        this.loading = false;
      }
    });
  }
}
