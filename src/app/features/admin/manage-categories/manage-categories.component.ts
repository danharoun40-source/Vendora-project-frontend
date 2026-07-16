import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category } from '../../../core/models/category.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-manage-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './manage-categories.component.html',
})
export class ManageCategoriesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);

  loading = signal(true);
  categories = signal<Category[]>([]);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  saving = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    image: [''],
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.categoryService.getAll().subscribe({
      next: (cats) => {
        this.categories.set(cats);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openAdd() {
    this.editingId.set(null);
    this.form.reset({ name: '', description: '', image: '' });
    this.showForm.set(true);
  }

  openEdit(cat: Category) {
    this.editingId.set(cat._id);
    this.form.reset({
      name: cat.name,
      description: cat.description ?? '',
      image: cat.image ?? '',
    });
    this.showForm.set(true);
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const payload = this.form.getRawValue();
    const editId = this.editingId();

    const req = editId ? this.categoryService.update(editId, payload) : this.categoryService.create(payload);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.toast.success(editId ? 'Category updated.' : 'Category added.');
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  remove(cat: Category) {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    this.categoryService.delete(cat._id).subscribe({
      next: () => {
        this.toast.success('Category deleted.');
        this.load();
      },
    });
  }
}
