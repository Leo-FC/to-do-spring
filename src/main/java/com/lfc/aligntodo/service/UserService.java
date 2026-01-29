package com.lfc.aligntodo.service;

import com.lfc.aligntodo.model.User;
import com.lfc.aligntodo.model.dto.UserCreateDTO;
import com.lfc.aligntodo.model.dto.UserUpdateDTO;
import com.lfc.aligntodo.model.enums.ProfileEnum;
import com.lfc.aligntodo.repository.UserRepository;
import com.lfc.aligntodo.security.UserSpringSecurity;
import com.lfc.aligntodo.service.exceptions.AuthorizationException;
import com.lfc.aligntodo.service.exceptions.DataBindingViolationException;
import com.lfc.aligntodo.service.exceptions.ObjectNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.validation.Valid;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class UserService {

    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    private UserRepository userRepository;

    public User findById(Long id){
        UserSpringSecurity userSpringSecurity = authenticated();
        if(!Objects.nonNull(userSpringSecurity) || !userSpringSecurity.hasRole(ProfileEnum.ADMIN) && !id.equals(userSpringSecurity.getId())){
            throw new AuthorizationException("Acesso negado");
        }

        Optional<User> user = userRepository.findById(id);

        return user.orElseThrow(() -> new ObjectNotFoundException("Usuario nao encontrado"));
    }

    public List<User> findAll(){
        List<User> users = userRepository.findAll();

        return users;
    }

    @Transactional
    public User create(User obj){
        obj.setId(null);
        obj.setPassword(bCryptPasswordEncoder.encode(obj.getPassword()));
        obj.setProfiles(Stream.of(ProfileEnum.USER.getCode()).collect(Collectors.toSet()));
        obj = this.userRepository.save(obj);

        return obj;
    }

    @Transactional
    public User update(User obj){
        User newObj = findById(obj.getId());

        newObj.setPassword(obj.getPassword());
        newObj.setPassword(bCryptPasswordEncoder.encode(newObj.getPassword()));

        return this.userRepository.save(newObj);
    }

    public void delete(Long id){
        findById(id);

        try {
            this.userRepository.deleteById(id);
        } catch (Exception e) {
            throw new DataBindingViolationException("Nao e possivel excluir pois ha entidades relacionadas");
        }
    }

    public static UserSpringSecurity authenticated(){
        try {
            return (UserSpringSecurity) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        }catch (Exception e){
            return null;
        }
    }

    public User fromDTO(@Valid UserCreateDTO obj){
        User user = new User();
        user.setUsername(obj.getUsername());
        user.setPassword(obj.getPassword());
        return user;
    }

    public User fromDTO(@Valid UserUpdateDTO obj){
        User user = new User();
        user.setId(obj.getId());
        user.setPassword(obj.getPassword());
        return user;
    }

}
