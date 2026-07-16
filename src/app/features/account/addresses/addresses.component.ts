import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddressService } from '../../../core/services/address.service';
import { ToastService } from '../../../core/services/toast.service';
import { Address } from '../../../core/models/address.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './addresses.component.html',
})
export class AddressesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private addressService = inject(AddressService);
  private toast = inject(ToastService);

  loading = signal(true);
  addresses = signal<Address[]>([]);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  saving = signal(false);

  form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    phone: ['', Validators.required],
    city: ['', Validators.required],
    street: ['', Validators.required],
    building: ['', Validators.required],
    apartment: [''],
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.addressService.getMine().subscribe({
      next: (res) => {
        this.addresses.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openAdd() {
    this.editingId.set(null);
    this.form.reset({ fullName: '', phone: '', city: '', street: '', building: '', apartment: '' });
    this.showForm.set(true);
  }

  openEdit(address: Address) {
    this.editingId.set(address._id);
    this.form.reset({
      fullName: address.fullName,
      phone: address.phone,
      city: address.city,
      street: address.street,
      building: address.building,
      apartment: address.apartment ?? '',
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

    const req = editId ? this.addressService.update(editId, payload) : this.addressService.add(payload);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.showForm.set(false);
        this.toast.success(editId ? 'Address updated.' : 'Address added.');
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  remove(address: Address) {
    if (!confirm('Delete this address?')) return;
    this.addressService.delete(address._id).subscribe({
      next: () => {
        this.toast.success('Address deleted.');
        this.load();
      },
    });
  }

  setDefault(address: Address) {
    this.addressService.setDefault(address._id).subscribe({
      next: () => {
        this.toast.success('Default address updated.');
        this.load();
      },
    });
  }
}
