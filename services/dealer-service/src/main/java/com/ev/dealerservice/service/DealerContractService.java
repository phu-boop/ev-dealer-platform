package com.ev.dealerservice.service;

import com.ev.dealerservice.dto.request.DealerContractRequest;
import com.ev.dealerservice.dto.response.DealerContractResponse;
import com.ev.dealerservice.entity.Dealer;
import com.ev.dealerservice.entity.DealerContract;
import com.ev.dealerservice.exception.DuplicateResourceException;
import com.ev.dealerservice.exception.ResourceNotFoundException;
import com.ev.dealerservice.repository.DealerContractRepository;
import com.ev.dealerservice.repository.DealerRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DealerContractService {

    private final DealerContractRepository contractRepository;
    private final DealerRepository dealerRepository;
    private final ModelMapper modelMapper;

    @Transactional(readOnly = true)
    public List<DealerContractResponse> getContractsByDealerId(Long dealerId) {
        return contractRepository.findByDealerDealerId(dealerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DealerContractResponse getContractById(Long id) {
        DealerContract contract = contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found with id: " + id));
        return mapToResponse(contract);
    }

    @Transactional
    public DealerContractResponse createContract(DealerContractRequest request) {
        if (contractRepository.existsByContractNumber(request.getContractNumber())) {
            throw new DuplicateResourceException("Contract with number " + request.getContractNumber() + " already exists");
        }

        Dealer dealer = dealerRepository.findById(request.getDealerId())
                .orElseThrow(() -> new ResourceNotFoundException("Dealer not found with id: " + request.getDealerId()));

        DealerContract contract = modelMapper.map(request, DealerContract.class);
        contract.setDealer(dealer);
        DealerContract savedContract = contractRepository.save(contract);
        return mapToResponse(savedContract);
    }

    @Transactional
    public DealerContractResponse updateContract(Long id, DealerContractRequest request) {
        DealerContract contract = contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found with id: " + id));

        if (!contract.getContractNumber().equals(request.getContractNumber()) &&
            contractRepository.existsByContractNumber(request.getContractNumber())) {
            throw new DuplicateResourceException("Contract with number " + request.getContractNumber() + " already exists");
        }

        modelMapper.map(request, contract);
        DealerContract updatedContract = contractRepository.save(contract);
        return mapToResponse(updatedContract);
    }

    private DealerContractResponse mapToResponse(DealerContract contract) {
        DealerContractResponse response = modelMapper.map(contract, DealerContractResponse.class);
        response.setDealerId(contract.getDealer().getDealerId());
        response.setDealerName(contract.getDealer().getDealerName());
        return response;
    }
}
