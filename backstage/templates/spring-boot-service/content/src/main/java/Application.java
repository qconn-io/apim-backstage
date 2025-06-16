package ${{ values.package_name }};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
{% if values.include_database %}
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;
{% endif %}
{% if values.include_swagger %}
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.Contact;
{% endif %}

{% if values.include_swagger %}
@OpenAPIDefinition(
    info = @Info(
        title = "${{ values.name | title }} API",
        version = "1.0.0",
        description = "${{ values.description }}",
        {% if values.contact_name or values.contact_email %}
        contact = @Contact(
            {% if values.contact_name %}name = "${{ values.contact_name }}"{% endif %}{% if values.contact_name and values.contact_email %},{% endif %}
            {% if values.contact_email %}email = "${{ values.contact_email }}"{% endif %}
        )
        {% endif %}
    )
)
{% endif %}
@SpringBootApplication
{% if values.include_database %}
@EnableJpaRepositories
@EnableTransactionManagement
{% endif %}
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

}
