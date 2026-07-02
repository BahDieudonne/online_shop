import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ShopPage from './ShopPage';

const SearchPage = () => {
  const [params] = useSearchParams();
  const q = params.get('q');
  return (
    <>
      <Helmet><title>{q ? `"${q}" Search` : 'Search'} | CHANCELOR STORE</title></Helmet>
      <ShopPage />
    </>
  );
};
export default SearchPage;
