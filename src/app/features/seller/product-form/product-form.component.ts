import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category } from '../../../core/models/category.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  auth = inject(AuthService);

  loading = signal(false);
  saving = signal(false);
  categories = signal<Category[]>([]);
  productId: string | null = null;
  imagePreview = signal<string | null>(null);
  selectedFile: File | null = null;

  backPath = this.auth.role() === 'admin' ? '/admin/products' : '/seller/products';

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    category: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
    stock: [1, [Validators.required, Validators.min(0)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
  });

  ngOnInit() {
    this.categoryService.getAll().subscribe({ next: (cats) => this.categories.set(cats) });

    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.loading.set(true);
      this.productService.getById(this.productId).subscribe({
        next: (res) => {
          const p = res.data.product;
          this.form.patchValue({
            name: p.name,
            category: p.category,
            price: p.price,
            stock: p.stock,
            description: p.description,
          });
          this.imagePreview.set(this.productService.imageUrl(p.image));
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const values = this.form.getRawValue();

    if (this.productId) {
      this.productService.update(this.productId, values).subscribe({
        next: () => {
          this.saving.set(false);
          this.toast.success('Product updated successfully.');
          this.router.navigate([this.backPath]);
        },
        error: () => this.saving.set(false),
      });
    } else {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => formData.append(key, String(value)));
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      this.productService.create(formData).subscribe({
        next: () => {
          this.saving.set(false);
          this.toast.success('Product added successfully.');
          this.router.navigate([this.backPath]);
        },
        error: () => this.saving.set(false),
      });
    }
  }
}
