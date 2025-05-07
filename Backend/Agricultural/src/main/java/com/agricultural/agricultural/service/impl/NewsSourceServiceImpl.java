package com.agricultural.agricultural.service.impl;

import com.agricultural.agricultural.dto.NewsSourceDTO;
import com.agricultural.agricultural.entity.NewsSource;
import com.agricultural.agricultural.exception.ResourceNotFoundException;
import com.agricultural.agricultural.mapper.NewsSourceMapper;
import com.agricultural.agricultural.repository.NewsSourceRepository;
import com.agricultural.agricultural.service.NewsSourceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsSourceServiceImpl implements NewsSourceService {

    private final NewsSourceRepository newsSourceRepository;
    private final NewsSourceMapper newsSourceMapper;

    @Override
    public List<NewsSourceDTO> getAllNewsSources() {
        List<NewsSource> sources = newsSourceRepository.findAll();
        return newsSourceMapper.toDTOList(sources);
    }

    @Override
    public List<NewsSourceDTO> getActiveNewsSources() {
        List<NewsSource> activeSources = newsSourceRepository.findAllByActiveTrue();
        return newsSourceMapper.toDTOList(activeSources);
    }

    @Override
    public List<NewsSourceDTO> getNewsSourcesByCategory(String category) {
        List<NewsSource> sources = newsSourceRepository.findAllByActiveTrueAndCategoryIgnoreCase(category);
        return newsSourceMapper.toDTOList(sources);
    }

    @Override
    public NewsSourceDTO getNewsSourceById(Long id) {
        NewsSource source = newsSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("News source not found with id: " + id));
        return newsSourceMapper.toDTO(source);
    }

    @Override
    @Transactional
    public NewsSourceDTO createNewsSource(NewsSourceDTO newsSourceDTO) {
        NewsSource source = newsSourceMapper.toEntity(newsSourceDTO);
        source.setActive(true);
        NewsSource savedSource = newsSourceRepository.save(source);
        return newsSourceMapper.toDTO(savedSource);
    }

    @Override
    @Transactional
    public NewsSourceDTO updateNewsSource(Long id, NewsSourceDTO newsSourceDTO) {
        NewsSource existingSource = newsSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("News source not found with id: " + id));

        existingSource.setName(newsSourceDTO.getName());
        existingSource.setUrl(newsSourceDTO.getUrl());
        existingSource.setArticleSelector(newsSourceDTO.getArticleSelector());
        existingSource.setTitleSelector(newsSourceDTO.getTitleSelector());
        existingSource.setSummarySelector(newsSourceDTO.getSummarySelector());
        existingSource.setContentSelector(newsSourceDTO.getContentSelector());
        existingSource.setImageSelector(newsSourceDTO.getImageSelector());
        existingSource.setDateSelector(newsSourceDTO.getDateSelector());
        existingSource.setDateFormat(newsSourceDTO.getDateFormat());
        existingSource.setCategory(newsSourceDTO.getCategory());
        
        if (newsSourceDTO.getActive() != null) {
            existingSource.setActive(newsSourceDTO.getActive());
        }

        NewsSource updatedSource = newsSourceRepository.save(existingSource);
        return newsSourceMapper.toDTO(updatedSource);
    }

    @Override
    @Transactional
    public void deleteNewsSource(Long id) {
        if (!newsSourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("News source not found with id: " + id);
        }
        newsSourceRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void activateNewsSource(Long id) {
        NewsSource source = newsSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("News source not found with id: " + id));
        source.setActive(true);
        newsSourceRepository.save(source);
    }

    @Override
    @Transactional
    public void deactivateNewsSource(Long id) {
        NewsSource source = newsSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("News source not found with id: " + id));
        source.setActive(false);
        newsSourceRepository.save(source);
    }
} 