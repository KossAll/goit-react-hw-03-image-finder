import { Component } from 'react';

import Searchbar from '../Searchbar/Searchbar';
import ImageGallery from '../ImageGallery/ImageGallery';
import { fetchImages } from '../../components/post-api';
import Button from '../../components/Button/Button';
import Loader from '../../components/Loader/Loader';
import Modal from '../../components/Modal/Modal';
import { toast } from 'react-toastify';

import styles from '../SearchImages/SearchImages.module.css';

class SearchImages extends Component {
  state = {
    search: '',
    items: [],
    loading: false,
    err: null,
    page: 1,
    showModal: false,
    total: 0,
    imgDetails: null,
  };

  componentDidUpdate(prevProps, prevState) {
    const { search, page } = this.state;
    if (prevState.search !== search || prevState.page !== page) {
      this.setState({ loading: true });
      this.fetchImages();
    }
  }

  async fetchImages() {
    try {
      const { search, page } = this.state;
      const { hits, totalHits } = await fetchImages(search, page);
      if (hits.length === 0) {
        toast.error('No result found!');
      }
      this.setState(({ items }) => ({
        items: [...items, ...hits],
        total: totalHits,
      }));
    } catch (err) {
      this.setState({ err: err.message });
    } finally {
      this.setState({ loading: false });
    }
  }

  searchImages = ({ search }) => {
    if (search !== this.state.search) {
      this.setState({ search, items: [], page: 1 });
    } else toast('you have already entered this query!');
  };

  loadMore = () => {
    this.setState(({ page }) => ({ page: page + 1 }));
  };

  openModal = (largeImageURL, tags) => {
    this.setState({
      showModal: true,
      imgDetails: { largeImageURL, tags },
    });
  };

  closeModal = () => {
    this.setState({
      showModal: false,
      imgDetails: null,
    });
  };

  render() {
    const body = document.querySelector('body');
    const { items, loading, err, showModal, imgDetails } = this.state;
    const { searchImages, loadMore, closeModal, openModal } = this;

    return (
      <div className={styles.search_images}>
        <Searchbar onSubmit={searchImages} />
        {items.length > 0 && <ImageGallery items={items} onClick={openModal} />}

        {err && <p className={styles.errorMessage}>{err}</p>}

        {loading && <Loader />}
        {Boolean(items.length) && !loading && (
          <Button onLoadMore={loadMore} text={'Load more'} />
        )}

        {showModal
          ? body.classList.add('overflow-hidden')
          : body.classList.remove('overflow-hidden')}

        {showModal && (
          <Modal close={closeModal}>
            <img src={imgDetails.largeImageURL} alt={imgDetails.tags} />
          </Modal>
        )}
      </div>
    );
  }
}

export default SearchImages;
