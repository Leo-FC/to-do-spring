package com.lfc.todosimple.service;

import com.lfc.todosimple.model.User;
import com.lfc.todosimple.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;



    public User findById(Long id){
        Optional<User> user = userRepository.findById(id);

        return user.orElseThrow(() -> new RuntimeException("Usuario nao encontrado"));
    }

    @Transactional
    public User create(User obj){
        obj.setId(null);

        obj = this.userRepository.save(obj);

        return obj;
    }

    @Transactional
    public User update(User obj){
        User newObj = findById(obj.getId());

        newObj.setPassword(obj.getPassword());

        return this.userRepository.save(newObj);
    }

    @Transactional
    public void delete(Long id){
        findById(id);

        try {
            this.userRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Nao e possivel excluir pois ha entidades relacionadas");
        }
    }

}
