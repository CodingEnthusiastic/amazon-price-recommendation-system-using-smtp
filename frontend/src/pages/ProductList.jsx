import { useEffect, useState } from 'react';
import { getProducts, addProduct, deleteProduct, updateProduct } from '../services/api';
import { FaTrash, FaToggleOn, FaToggleOff, FaPlus, FaExternalLinkAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './ProductList.css';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ url: '', targetPrice: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('📦 Fetching products...');
      const response = await getProducts();
      setProducts(response.data.products);
      console.log('✅ Products loaded:', response.data.products.length);
    } catch (error) {
      console.error('❌ Failed to load products:', error.message);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    if (!newProduct.url || !newProduct.targetPrice) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await addProduct(newProduct);
      toast.success('Product added successfully!');
      setNewProduct({ url: '', targetPrice: '' });
      setShowAddForm(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await updateProduct(product.id, { isActive: !product.is_active });
      toast.success(product.is_active ? 'Tracking paused' : 'Tracking resumed');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <main className="product-list">
      <div className="container">
        <div className="header-section">
          <h1>My Products</h1>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <FaPlus /> Add Product
          </button>
        </div>

        {showAddForm && (
          <div className="add-product-form card">
            <h2>Add New Product</h2>
            <form onSubmit={handleAddProduct}>
              <input
                type="url"
                className="input"
                placeholder="Amazon Product URL"
                value={newProduct.url}
                onChange={(e) => setNewProduct({ ...newProduct, url: e.target.value })}
                required
              />
              <input
                type="number"
                className="input"
                placeholder="Target Price (₹)"
                value={newProduct.targetPrice}
                onChange={(e) => setNewProduct({ ...newProduct, targetPrice: e.target.value })}
                required
                min="0"
                step="0.01"
              />
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Add Product
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {products.length === 0 ? (
          <div className="empty-state card">
            <h2>No products yet</h2>
            <p>Start tracking Amazon products by adding their URLs above.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className={`product-card card ${!product.is_active ? 'inactive' : ''}`}>
                <div className="product-header">
                  <h3>{product.product_name || 'Loading...'}</h3>
                  <button
                    className="toggle-btn"
                    onClick={() => handleToggleActive(product)}
                    title={product.is_active ? 'Pause tracking' : 'Resume tracking'}
                  >
                    {product.is_active ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                </div>

                <div className="product-prices">
                  <div className="price-item">
                    <span className="price-label">Current Price:</span>
                    <span className="price-value">
                      {product.current_price ? `₹${product.current_price}` : 'Checking...'}
                    </span>
                  </div>
                  <div className="price-item">
                    <span className="price-label">Target Price:</span>
                    <span className="price-value target">₹{product.target_price}</span>
                  </div>
                </div>

                {product.current_price && product.current_price < product.target_price && (
                  <div className="deal-badge">
                    🎉 Deal Found! Save ₹{(product.target_price - product.current_price).toFixed(2)}
                  </div>
                )}

                <div className="product-footer">
                  <a 
                    href={product.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-small"
                  >
                    <FaExternalLinkAlt /> View on Amazon
                  </a>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>

                {product.last_checked && (
                  <div className="last-checked">
                    Last checked: {new Date(product.last_checked).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default ProductList;
