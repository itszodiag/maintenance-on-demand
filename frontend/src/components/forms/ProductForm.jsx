import {
  moroccoCities,
  productCategories,
  productSpecialities,
} from '../../data/options.js';

export function ProductForm({
  form,
  onChange,
  onFiles,
  onSubmit,
  loading,
  submitLabel = 'Save product',
}) {
  const imagePreviews = (form.images ?? [])
    .map((image) => {
      if (typeof image === 'string') {
        return image;
      }
      if (image instanceof File) {
        return URL.createObjectURL(image);
      }
      return null;
    })
    .filter(Boolean);

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <input
        className="field"
        name="title"
        placeholder="Product title"
        value={form.title}
        onChange={onChange}
        required
      />
      <input
        className="field"
        name="brand"
        placeholder="Brand"
        value={form.brand}
        onChange={onChange}
        required
      />
      <textarea
        className="field md:col-span-2"
        rows="4"
        name="description"
        placeholder="Describe the product and its usage..."
        value={form.description}
        onChange={onChange}
        required
      />
      <input
        className="field"
        name="price"
        type="number"
        min="0"
        step="0.01"
        placeholder="Price"
        value={form.price}
        onChange={onChange}
        required
      />
      <input
        className="field"
        name="stock"
        type="number"
        min="0"
        step="1"
        placeholder="Stock"
        value={form.stock}
        onChange={onChange}
        required
      />
      <select
        className="field"
        name="category"
        value={form.category}
        onChange={onChange}
        required
      >
        <option value="">Select category</option>
        {productCategories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <select
        className="field"
        name="speciality"
        value={form.speciality}
        onChange={onChange}
        required
      >
        <option value="">Select speciality</option>
        {productSpecialities.map((speciality) => (
          <option key={speciality} value={speciality}>
            {speciality}
          </option>
        ))}
      </select>
      <select
        className="field"
        name="city"
        value={form.city}
        onChange={onChange}
        required
      >
        <option value="">Select city</option>
        {moroccoCities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
      <input
        className="field"
        name="latitude"
        type="number"
        step="0.000001"
        placeholder="Latitude"
        value={form.latitude}
        onChange={onChange}
      />
      <input
        className="field"
        name="longitude"
        type="number"
        step="0.000001"
        placeholder="Longitude"
        value={form.longitude}
        onChange={onChange}
      />
      <input
        className="field md:col-span-2"
        type="file"
        multiple
        accept="image/*"
        onChange={onFiles}
        required={!form.id}
      />

      {imagePreviews.length > 0 && (
        <div className="md:col-span-2 grid grid-cols-3 gap-2">
          {imagePreviews.map((src, idx) => (
            <img
              key={`${src}-${idx}`}
              src={src}
              alt={`Preview ${idx + 1}`}
              className="h-24 w-full rounded-lg border object-cover"
            />
          ))}
        </div>
      )}

      <button
        type="submit"
        className="button-primary md:col-span-2"
        disabled={loading}
      >
        {loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
