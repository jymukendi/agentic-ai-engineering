import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, OnInit, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Book } from './book';
import { BookApiClient } from './book-api-client.service';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-book-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container mx-auto px-4 py-8 max-w-3xl">
      <!-- Back Button -->
      <button
        [routerLink]="['/books', state().book?.isbn]"
        class="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        <span>Back to Book</span>
      </button>

      <!-- Loading State -->
      @if (state().loading) {
        <div class="flex justify-center items-center py-20">
          <div class="animate-pulse flex flex-col items-center">
            <div
              class="h-16 w-16 rounded-full border-4 border-t-blue-700 border-r-blue-700 border-b-gray-200 border-l-gray-200 animate-spin"
            ></div>
            <p class="mt-4 text-gray-600">Loading book details...</p>
          </div>
        </div>
      }

      <!-- Error State -->
      @if (state().error && !state().loading) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg class="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h2 class="text-xl font-semibold text-red-800 mb-2">{{ state().error }}</h2>
          <p class="text-red-600 mb-4">Please try again or return to the book list.</p>
          <button
            [routerLink]="['/books', state().book?.isbn]"
            class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
          >
            Return to Book
          </button>
        </div>
      }

      <!-- Edit Form -->
      @if (state().book && !state().loading && !state().error) {
        <article>
          <header class="mb-8">
            <h1 class="text-4xl font-bold text-gray-900 mb-2">Edit Book</h1>
            <p class="text-gray-600">{{ state().book?.title }}</p>
          </header>

          <form [formGroup]="bookForm" (ngSubmit)="save()" class="bg-white rounded-lg shadow-md p-8 space-y-6">
            <!-- Title -->
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 mb-2">Title <span class="text-red-500">*</span></label>
              <input
                id="title"
                type="text"
                formControlName="title"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                [class.border-red-500]="isFieldInvalid('title')"
                [class.border-gray-300]="!isFieldInvalid('title')"
              />
              @if (isFieldInvalid('title')) {
                <p class="mt-1 text-sm text-red-600">{{ getFieldError('title') }}</p>
              }
            </div>

            <!-- Subtitle -->
            <div>
              <label for="subtitle" class="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
              <input
                id="subtitle"
                type="text"
                formControlName="subtitle"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Author -->
            <div>
              <label for="author" class="block text-sm font-medium text-gray-700 mb-2">Author <span class="text-red-500">*</span></label>
              <input
                id="author"
                type="text"
                formControlName="author"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                [class.border-red-500]="isFieldInvalid('author')"
                [class.border-gray-300]="!isFieldInvalid('author')"
              />
              @if (isFieldInvalid('author')) {
                <p class="mt-1 text-sm text-red-600">{{ getFieldError('author') }}</p>
              }
            </div>

            <!-- Publisher -->
            <div>
              <label for="publisher" class="block text-sm font-medium text-gray-700 mb-2">Publisher</label>
              <input
                id="publisher"
                type="text"
                formControlName="publisher"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Number of Pages -->
            <div>
              <label for="numPages" class="block text-sm font-medium text-gray-700 mb-2">Number of Pages</label>
              <input
                id="numPages"
                type="number"
                formControlName="numPages"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Price -->
            <div>
              <label for="price" class="block text-sm font-medium text-gray-700 mb-2">Price (€)</label>
              <input
                id="price"
                type="text"
                formControlName="price"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <!-- Cover URL -->
            <div>
              <label for="cover" class="block text-sm font-medium text-gray-700 mb-2">Cover Image URL</label>
              <input
                id="cover"
                type="url"
                formControlName="cover"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Abstract -->
            <div>
              <label for="abstract" class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                id="abstract"
                formControlName="abstract"
                rows="6"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <!-- ISBN (Read-only) -->
            <div>
              <label for="isbn" class="block text-sm font-medium text-gray-700 mb-2">ISBN (Read-only)</label>
              <input
                id="isbn"
                type="text"
                [value]="state().book?.isbn"
                disabled
                class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>

            <!-- Form Actions -->
            <div class="flex gap-4 pt-6">
              <button
                type="submit"
                [disabled]="bookForm.invalid || isSubmitting()"
                [class.opacity-50]="bookForm.invalid || isSubmitting()"
                [class.cursor-not-allowed]="bookForm.invalid || isSubmitting()"
                class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {{ isSubmitting() ? 'Saving...' : 'Save Changes' }}
              </button>
              <button
                type="button"
                [routerLink]="['/books', state().book?.isbn]"
                class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </article>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class BookEditComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly bookApiClient = inject(BookApiClient);
  private readonly toastService = inject(ToastService);

  state = signal<{ book?: Book; loading: boolean; error?: string }>({ loading: true });
  isSubmitting = signal(false);

  bookForm: FormGroup = this.formBuilder.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    subtitle: [''],
    author: ['', [Validators.required, Validators.minLength(1)]],
    publisher: [''],
    numPages: [0],
    price: [''],
    cover: [''],
    abstract: ['']
  });

  ngOnInit(): void {
    const isbn = this.activatedRoute.snapshot.paramMap.get('isbn');
    if (isbn) {
      this.loadBookData(isbn);
    } else {
      this.state.update(s => ({ ...s, error: 'Invalid ISBN provided', loading: false }));
    }
  }

  private loadBookData(isbn: string): void {
    this.bookApiClient
      .getSingleBook(isbn)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (book: Book) => {
          this.bookForm.setValue({
            title: book.title,
            subtitle: book.subtitle || '',
            author: book.author,
            publisher: book.publisher,
            numPages: book.numPages,
            price: book.price,
            cover: book.cover,
            abstract: book.abstract
          });
          this.state.update(s => ({ ...s, book, loading: false }));
        },
        error: (err: any) => {
          console.error('Error loading book:', err);
          const errorMessage = err.status === 404 ? 'Book not found' : 'Failed to load book details';
          this.state.update(s => ({ ...s, error: errorMessage, loading: false }));
        }
      });
  }

  save(): void {
    if (this.bookForm.invalid) {
      return;
    }

    this.isSubmitting.set(true);
    const isbn = this.state().book?.isbn;

    if (!isbn) {
      this.toastService.show('Error: ISBN not found', 3000);
      this.isSubmitting.set(false);
      return;
    }

    this.bookApiClient
      .updateBook(isbn, this.bookForm.value)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => {
          this.toastService.show('Book updated successfully!');
          this.router.navigate(['/books', isbn]);
        },
        error: (err: any) => {
          console.error('Error updating book:', err);
          const errorMessage = err.status === 404 ? 'Book not found' : 'Failed to update book';
          this.toastService.show(errorMessage, 3000);
          this.isSubmitting.set(false);
        },
        complete: () => {
          this.isSubmitting.set(false);
        }
      });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.bookForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.bookForm.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return `${fieldName} must be at least ${minLength} characters`;
    }

    return 'Invalid field';
  }
}
